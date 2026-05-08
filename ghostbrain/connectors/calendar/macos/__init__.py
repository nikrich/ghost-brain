"""Apple Calendar (macOS) connector.

Reads events directly from ``Calendar.app`` via JXA (JavaScript for
Automation, ``osascript -l JavaScript``). No API tokens, no third-party
auth — Apple Calendar is already syncing whatever accounts the user
added in System Settings → Internet Accounts (iCloud, Google, Exchange).

This is the path that works for tenants like Sanlam where Microsoft
Graph delegated permission is admin-blocked: Calendar.app uses Apple's
sanctioned EAS/EWS connection, ghostbrain just reads the local cache.
"""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from ghostbrain.connectors._base import Connector
from ghostbrain.connectors.calendar._base import CalendarEvent

log = logging.getLogger("ghostbrain.connectors.calendar.macos")

DEFAULT_LOOKAHEAD_HOURS = 36
OSASCRIPT_TIMEOUT_S = 60


JXA_SCRIPT = r"""
ObjC.import('Foundation');

function run(argv) {
    if (argv.length < 3) {
        return JSON.stringify({error: "usage: <startISO> <endISO> <calendarNameJSON>"});
    }
    var startIso = argv[0];
    var endIso = argv[1];
    var targetNames = JSON.parse(argv[2]);

    var startDate = new Date(startIso);
    var endDate = new Date(endIso);

    var Calendar = Application('Calendar');
    Calendar.includeStandardAdditions = true;

    var allCalendars = Calendar.calendars();
    var results = [];
    var errors = [];

    for (var i = 0; i < allCalendars.length; i++) {
        var cal = allCalendars[i];
        var calName;
        try {
            calName = cal.name();
        } catch (e) {
            continue;
        }
        if (targetNames.length > 0 && targetNames.indexOf(calName) === -1) {
            continue;
        }
        var events;
        try {
            events = cal.events.whose({_and: [
                {startDate: {_greaterThan: startDate}},
                {startDate: {_lessThan: endDate}},
            ]})();
        } catch (e) {
            errors.push({calendar: calName, error: String(e)});
            continue;
        }
        for (var j = 0; j < events.length; j++) {
            var ev = events[j];
            try {
                results.push({
                    calendar: calName,
                    uid: safeGet(ev, 'uid'),
                    summary: safeGet(ev, 'summary') || "",
                    start: isoOrNull(safeGet(ev, 'startDate')),
                    end: isoOrNull(safeGet(ev, 'endDate')),
                    location: safeGet(ev, 'location') || "",
                    description: (safeGet(ev, 'description') || "").substring(0, 5000),
                    allDay: !!safeGet(ev, 'alldayEvent'),
                    url: safeGet(ev, 'url') || "",
                });
            } catch (e) {
                // skip malformed events
            }
        }
    }

    return JSON.stringify({events: results, errors: errors});
}

function safeGet(obj, prop) {
    try {
        var fn = obj[prop];
        if (typeof fn === 'function') return fn();
        return fn;
    } catch (e) {
        return null;
    }
}

function isoOrNull(d) {
    if (!d) return null;
    try {
        return d.toISOString();
    } catch (e) {
        return null;
    }
}
"""


class MacosCalendarConnector(Connector):
    name = "macos_calendar"
    version = "1.0"

    def __init__(
        self,
        config: dict,
        queue_dir: Path,
        state_dir: Path,
    ) -> None:
        super().__init__(config, queue_dir, state_dir)
        # config["accounts"] is { calendar_name: context }.
        self.calendar_contexts: dict[str, str] = dict(config.get("accounts") or {})
        self.lookahead_hours = int(
            config.get("lookahead_hours") or DEFAULT_LOOKAHEAD_HOURS
        )
        self._osascript = shutil.which("osascript") or "/usr/bin/osascript"

    def health_check(self) -> bool:
        if not self.calendar_contexts:
            return False
        # If osascript is callable AND Calendar.app responds with at least one
        # calendar, we're good.
        try:
            cmd = [
                self._osascript,
                "-e",
                'tell application "Calendar" to return count of calendars',
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            return proc.returncode == 0 and (proc.stdout or "").strip().isdigit()
        except Exception:  # noqa: BLE001
            return False

    def fetch(self, since: datetime) -> list[dict]:
        if not self.calendar_contexts:
            log.info("no macos calendars configured; skipping")
            return []

        now = datetime.now(timezone.utc)
        start = now
        end = now + timedelta(hours=self.lookahead_hours)

        target_names = list(self.calendar_contexts.keys())

        try:
            payload = self._run_jxa(start, end, target_names)
        except Exception as e:  # noqa: BLE001
            log.exception("macos calendar fetch failed: %s", e)
            return []

        events_raw = (payload.get("events") or [])
        for err in payload.get("errors") or []:
            log.warning("macos calendar fetch error for %s: %s",
                        err.get("calendar"), err.get("error"))

        events: list[dict] = []
        for raw in events_raw:
            ce = self._to_calendar_event(raw)
            if ce is not None:
                events.append(ce.to_event())

        log.info("macos calendar fetch: %d event(s) across %d calendar(s)",
                 len(events), len(target_names))
        return events

    def normalize(self, raw: dict) -> dict:
        return raw

    # ------------------------------------------------------------------

    def _run_jxa(
        self,
        start: datetime,
        end: datetime,
        calendar_names: list[str],
    ) -> dict[str, Any]:
        cmd = [
            self._osascript,
            "-l", "JavaScript",
            "-e", JXA_SCRIPT,
            start.isoformat(),
            end.isoformat(),
            json.dumps(calendar_names),
        ]
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=OSASCRIPT_TIMEOUT_S,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"osascript exited {proc.returncode}: "
                f"{(proc.stderr or '').strip()[:300]}"
            )
        try:
            return json.loads(proc.stdout or "{}")
        except json.JSONDecodeError as e:
            raise RuntimeError(
                f"osascript stdout not JSON: {proc.stdout[:300]!r}"
            ) from e

    def _to_calendar_event(self, raw: dict) -> CalendarEvent | None:
        cal_name = raw.get("calendar") or ""
        if not cal_name:
            return None
        if cal_name not in self.calendar_contexts:
            return None
        start = raw.get("start") or ""
        if not start:
            return None
        end = raw.get("end") or start
        is_all_day = bool(raw.get("allDay"))

        # All-day events come back as midnight ISO strings; render as date-only
        # to match Google's all-day shape.
        if is_all_day and "T" in start:
            start = start.split("T", 1)[0]
            if end and "T" in end:
                end = end.split("T", 1)[0]

        return CalendarEvent(
            provider="macos",
            account=cal_name,
            event_id=str(raw.get("uid") or ""),
            title=str(raw.get("summary") or "(no title)"),
            start=start,
            end=end,
            is_all_day=is_all_day,
            location=str(raw.get("location") or ""),
            organizer="",  # JXA Calendar dictionary doesn't expose organizer well
            attendees=(),
            description=str(raw.get("description") or ""),
            url=str(raw.get("url") or ""),
            raw=raw,
        )

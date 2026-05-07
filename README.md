# Ghost Brain

A self-hosted personal knowledge automation system. Captures activity from
your tools (Claude Code & Desktop, GitHub, Jira, Confluence, Slack, Gmail,
Teams, Calendar) into an Obsidian vault, classifies and summarizes it with
an LLM, and serves it back as a daily digest.

> **Status: alpha.** Phases 1–2 of the [build sequence](./spec/SPEC.md#section-9--build-sequence-phased)
> are complete. The LLM-driven processing pipeline (Phase 3+) is next. The
> system is designed to be incrementally adopted phase by phase.

## Why

Most "second brain" tools are either manual (you stop adding things) or
SaaS (your private context lives on someone else's servers). Ghost Brain is
local-first, file-based, uses your existing Claude subscription for LLM calls,
and adds new sources via a small connector pattern.

## How it works

```
Sources (Claude Code, GitHub, Jira, …)
        │  connectors normalize to a standard event shape
        ▼
Filesystem queue: <vault>/90-meta/queue/pending/
        │
        ▼
Worker pipeline: route → generate note → extract artifacts → audit
        │
        ▼
Obsidian vault: 20-contexts/<ctx>/<source>/, 80-profile/, 60-dashboards/
        │
        ▼
Daily digest at <vault>/10-daily/<date>.md
```

See [SPEC §2](./spec/SPEC.md#section-2--system-overview) for the full picture.

## Tech stack

- **Python 3.11+** for connectors, worker, processing pipeline.
- **Anthropic Claude** via the `claude` CLI subprocess. The default backend uses
  your Claude Max subscription, so no `ANTHROPIC_API_KEY` is required. See
  [SPEC §12.1](./spec/SPEC.md#121-llm-backend-and-costs) if you'd rather use the
  metered API.
- **Obsidian** as the vault, with the Dataview, Templater, Periodic Notes, and
  Local REST API plugins.
- **macOS launchd** for orchestration. No broker, no Docker.
- **Filesystem queue** for events.

Linux support is a goal but currently macOS-first. Windows is out of scope.

## Setup

### 1. Clone and install

```bash
git clone <fork-or-upstream-url> ghost-brain
cd ghost-brain
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 2. Make sure Claude Code is logged in

Confirm the CLI is on PATH and you have an active session:

```bash
claude --version
claude     # interactive — quit out once you see the prompt
```

LLM calls run as `claude -p "<prompt>" --output-format json`. To use the
metered Anthropic API instead, see [SPEC §12.1](./spec/SPEC.md#121-llm-backend-and-costs).

### 3. Choose a vault location (optional)

Default is `~/ghostbrain/vault/`. Override with:

```bash
export VAULT_PATH="$HOME/some/other/path"
```

### 4. Bootstrap the vault

```bash
ghostbrain-bootstrap
```

Creates the directory tree from [SPEC §3.1](./spec/SPEC.md#section-3--vault-structure)
and seed files for `routing.yaml`, `config.yaml`, and prompt stubs. Idempotent.

### 5. Install Obsidian plugins (manual)

Open the vault in Obsidian, then **Settings → Community plugins**:

- Dataview
- Templater
- Periodic Notes
- Local REST API

These have to come from the in-app browser; they aren't installable from the CLI.

### 6. Configure routing

Edit `<vault>/90-meta/routing.yaml` to map your sources (GitHub orgs, Jira
sites, Claude Code project paths, etc.) to context names. Every entry is
marked `TODO` after a fresh bootstrap.

The four default contexts are placeholders for the typical split:
**work / employer**, **personal company / consulting**, **side product**,
and **personal life**. They're currently hard-coded as
`sanlam / codeship / reducedrecipes / personal` (the original author's
contexts). Renaming them requires editing `ghostbrain/bootstrap.py:CONTEXTS`
and any references in your local profile content; full configurability is
[Phase 14](./spec/SPEC.md#phase-14--open-source-packaging-final) work.

### 7. Run the worker

**Foreground (development):**

```bash
ghostbrain-worker
```

**Under launchd (always-on):**

The plists in `orchestration/launchd/` contain absolute paths from the
original author's machine. Edit them to use your repo path, username, and
vault location before loading. (A templated `setup.sh` is planned for
Phase 14.)

```bash
mkdir -p logs ~/Library/LaunchAgents
# Edit the plists first, then:
cp orchestration/launchd/*.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ghostbrain.worker.plist
```

Stop it with `launchctl unload ~/Library/LaunchAgents/com.ghostbrain.worker.plist`.

## Profile and CLAUDE.md generation

The profile lives in `<vault>/80-profile/`. Hand-write:

- `working-style.md` — how you work, decision style, communication preferences.
- `preferences.md` — tools, languages, what you don't want.
- `current-projects.md` — active work, **with H2 headings per context**. The
  generator filters this file to the heading matching the project's context.
- Per-context profile in `<vault>/20-contexts/<ctx>/_profile.md`.

Routing of project paths to contexts is in `routing.yaml` under
`claude_code.project_paths` (longest-prefix match wins).

Regenerate per-project `CLAUDE.md`:

```bash
# One project:
ghostbrain-claude-md /path/to/your/project

# Every project under configured roots (default: ~/code, ~/development):
ghostbrain-claude-md --all
```

To schedule a nightly regen, load `com.ghostbrain.claudemd.plist` (after
editing it for your machine) — runs daily at 02:00.

## Verifying the install

```bash
ghostbrain-bootstrap

# Drop a synthetic event:
cat > "$VAULT_PATH/90-meta/queue/pending/manual-test.json" <<'EOF'
{
  "id": "manual-test-1",
  "source": "manual",
  "type": "note",
  "timestamp": "2026-05-07T10:00:00Z",
  "title": "Verification",
  "body": "hi"
}
EOF

# Run the worker:
ghostbrain-worker
```

In another terminal you should see the file move within ~5 seconds:

```bash
ls "$VAULT_PATH/90-meta/queue/done/"
tail -f "$VAULT_PATH/90-meta/audit/"*.jsonl
```

The audit log should contain an `event_processed` line with
`status: "success"`.

## Tests

```bash
pytest
```

## Repo layout

```
ghost-brain/
├── spec/SPEC.md                        # source of truth — read first
├── pyproject.toml
├── ghostbrain/                         # Python package
│   ├── paths.py                        # vault/queue/audit/state path resolution
│   ├── bootstrap.py                    # vault tree creator (idempotent)
│   ├── connectors/_base.py             # base Connector class
│   ├── profile/claude_md.py            # per-project CLAUDE.md generator
│   └── worker/
│       ├── main.py                     # run loop (Phase 1 stub pipeline)
│       └── audit.py                    # JSONL audit log writer
├── orchestration/launchd/              # launchd plists
└── tests/
```

See [SPEC §11](./spec/SPEC.md#section-11--repository-structure) for the planned
full layout.

## Adding a connector

A connector is a class that subclasses `ghostbrain.connectors._base.Connector`
and implements `fetch()`, `normalize()`, and `health_check()`. Five steps to
add e.g. a Linear connector:

1. Create `ghostbrain/connectors/linear/`.
2. Implement `LinearConnector(Connector)`.
3. Register it (registry lands in Phase 4).
4. Add routing rules in `<vault>/90-meta/routing.yaml`.
5. Add a launchd schedule entry in `orchestration/launchd/`.

Prompts live in `<vault>/90-meta/prompts/` — edit them directly to tune
classification, extraction, or digest tone.

See [SPEC §4](./spec/SPEC.md#section-4--connector-architecture) and
[§4.4](./spec/SPEC.md#44-adding-a-new-connector).

## For coding agents working on this repo

If you're a Claude Code (or other coding-agent) session working on this
codebase:

1. Read [spec/SPEC.md](./spec/SPEC.md) end-to-end.
2. Determine the current phase from `git log --oneline` — each completed
   phase ends in a `feat: phase N <name>` commit.
3. Work on the next phase only. Each has explicit acceptance criteria in
   [§9](./spec/SPEC.md#section-9--build-sequence-phased) — don't skip ahead.
4. Commit at the end of each phase with the phase name in the message.

## Contributing

The project is alpha and the surface area will change between phases. Issues
and PRs are welcome — please open an issue first to discuss substantive
changes. New connectors and prompt improvements are particularly useful.

## License

MIT (planned, not yet applied to source files).

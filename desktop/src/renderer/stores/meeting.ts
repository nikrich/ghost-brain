import { create } from 'zustand';

export type MeetingPhase = 'pre' | 'recording' | 'post';

interface MeetingState {
  phase: MeetingPhase;
  startedAt: number | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useMeeting = create<MeetingState>((set) => ({
  phase: 'pre',
  startedAt: null,
  start: () => set({ phase: 'recording', startedAt: Date.now() }),
  stop: () => set({ phase: 'post' }),
  reset: () => set({ phase: 'pre', startedAt: null }),
}));

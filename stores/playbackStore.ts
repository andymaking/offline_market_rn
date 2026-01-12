import { create } from 'zustand';

export type PlaybackStatus = 'paused' | 'playing' | 'finished';

export type PlaybackState = {
  status: PlaybackStatus;
  speed: 1 | 2 | 4;
  currentIndex: number;
  totalEvents: number;
  lastTickMs: number | null;
  setTotalEvents: (n: number) => void;
  play: () => void;
  pause: () => void;
  finish: () => void;
  restart: () => void;
  setSpeed: (s: 1 | 2 | 4) => void;
  advance: (by?: number) => void;
  setLastTick: (ms: number) => void;
};

export const usePlaybackStore = create<PlaybackState>()((
  set: (
    partial:
      | PlaybackState
      | Partial<PlaybackState>
      | ((state: PlaybackState) => PlaybackState | Partial<PlaybackState>)
  ) => void,
  get: () => PlaybackState
) => ({
  status: 'paused',
  speed: 1,
  currentIndex: 0,
  totalEvents: 0,
  lastTickMs: null,

  setTotalEvents: (n: number) => set({ totalEvents: n }),

  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),
  finish: () => set({ status: 'finished' }),

  restart: () =>
    set({
      status: 'paused',
      currentIndex: 0,
      lastTickMs: null,
    }),

  setSpeed: (s: 1 | 2 | 4) => set({ speed: s }),

  advance: (by = 1) => {
    const { currentIndex, totalEvents } = get();
    const next = Math.min(currentIndex + by, Math.max(totalEvents - 1, 0));
    set({ currentIndex: next });
  },

  setLastTick: (ms: number) => set({ lastTickMs: ms }),
}));

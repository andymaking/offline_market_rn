import { create } from 'zustand';

export type PrefsState = {
  hideSmallBalances: boolean;
  setHideSmallBalances: (v: boolean) => void;
};

export const usePrefsStore = create<PrefsState>()((
  set: (
    partial:
      | PrefsState
      | Partial<PrefsState>
      | ((state: PrefsState) => PrefsState | Partial<PrefsState>)
  ) => void
) => ({
  hideSmallBalances: false,
  setHideSmallBalances: (v: boolean) => set({ hideSmallBalances: v }),
}));

import { StateCreator } from "zustand";

export interface UiSlice {
  loadingActions: Record<string, { at: number; message?: string }>;
  startLoading: (key: string, message?: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  anyLoading: () => boolean;
  latestMessage: () => string | undefined;
}

export const createUiSlice: StateCreator<UiSlice> = (set, get) => ({
  loadingActions: {},
  startLoading: (key: string, message?: string) =>
    set((state) => ({
      loadingActions: {
        ...state.loadingActions,
        [key]: { at: Date.now(), message },
      },
    })),
  stopLoading: (key: string) =>
    set((state) => {
      const next = { ...state.loadingActions };
      delete next[key];
      return { loadingActions: next };
    }),
  isLoading: (key: string) => Boolean(get().loadingActions[key]),
  anyLoading: () => Object.keys(get().loadingActions).length > 0,
  latestMessage: () => {
    const entries = Object.entries(get().loadingActions);
    if (!entries.length) return undefined;
    const sorted = entries.sort((a, b) => b[1].at - a[1].at);
    return sorted[0][1].message;
  },
});

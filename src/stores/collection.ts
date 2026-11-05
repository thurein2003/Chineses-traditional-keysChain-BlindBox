"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ZODIAC, type ZodiacId } from "@/data/zodiac";
export type Counts = Partial<Record<ZodiacId, number>>;
export const COLLECTION_KEY = "lucky-twelve-collection";
export function validateCounts(value: unknown): Counts {
  if (!value || typeof value !== "object") return {};
  const result: Counts = {};
  for (const { id } of ZODIAC) {
    const count = (value as Record<string, unknown>)[id];
    if (typeof count === "number" && Number.isSafeInteger(count) && count > 0)
      result[id] = Math.min(count, 999999);
  }
  return result;
}
interface CollectionState {
  counts: Counts;
  totalOpened: number;
  effects: boolean;
  sound: boolean;
  storageError: boolean;
  recordWin: (id: ZodiacId) => void;
  reset: () => void;
  setEffects: (effects: boolean) => void;
  setSound: (sound: boolean) => void;
}
const safeStorage = {
  getItem: (key: string) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) JSON.parse(raw);
      return raw;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      queueMicrotask(() => {
        if (!useCollection.getState().storageError)
          useCollection.setState({ storageError: true });
      });
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* session remains usable */
    }
  },
};
export const useCollection = create<CollectionState>()(
  persist(
    (set) => ({
      counts: {},
      totalOpened: 0,
      effects: true,
      sound: false,
      storageError: false,
      recordWin: (id) =>
        set((state) => ({
          counts: {
            ...state.counts,
            [id]: Math.min((state.counts[id] ?? 0) + 1, 999999),
          },
          totalOpened: state.totalOpened + 1,
        })),
      reset: () => set({ counts: {}, totalOpened: 0 }),
      setEffects: (effects) => set({ effects }),
      setSound: (sound) => set({ sound }),
    }),
    {
      name: COLLECTION_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        counts: state.counts,
        totalOpened: state.totalOpened,
        effects: state.effects,
        sound: state.sound,
      }),
      migrate: () => ({
        counts: {},
        totalOpened: 0,
        effects: true,
        sound: false,
      }),
      merge: (saved, current) => {
        const s = (saved && typeof saved === "object" ? saved : {}) as Record<
          string,
          unknown
        >;
        const counts = validateCounts(s.counts);
        return {
          ...current,
          counts,
          totalOpened: Object.values(counts).reduce((a, b) => a + (b ?? 0), 0),
          effects: typeof s.effects === "boolean" ? s.effects : true,
          sound: typeof s.sound === "boolean" ? s.sound : false,
        };
      },
    },
  ),
);

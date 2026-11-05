import { describe, it, expect, beforeEach, vi } from "vitest";
import { unboxingReducer, initialUnboxing } from "@/lib/unboxing";
import { ZODIAC } from "@/data/zodiac";
import {
  useCollection,
  validateCounts,
  COLLECTION_KEY,
} from "@/stores/collection";
describe("one stable reward per opening", () => {
  it("accepts one opening and advances through every phase without changing the reward", () => {
    let state = unboxingReducer(initialUnboxing, {
      type: "START",
      reward: ZODIAC[4],
    });
    expect(state.phase).toBe("SELECTING");
    expect(unboxingReducer(state, { type: "START", reward: ZODIAC[2] })).toBe(
      state,
    );
    expect(unboxingReducer(state, { type: "RESET" })).toBe(state);
    for (const phase of [
      "ANTICIPATING",
      "OPENING",
      "REVEALING",
      "CELEBRATING",
      "RESULT",
    ]) {
      state = unboxingReducer(state, { type: "NEXT" });
      expect(state.phase).toBe(phase);
      expect(state.reward).toBe(ZODIAC[4]);
    }
    expect(unboxingReducer(state, { type: "NEXT" })).toBe(state);
    expect(unboxingReducer(state, { type: "RESET" })).toEqual(initialUnboxing);
  });
  it("allows skipping only after a reward has been selected", () => {
    expect(unboxingReducer(initialUnboxing, { type: "SKIP" })).toBe(
      initialUnboxing,
    );
    const state = unboxingReducer(initialUnboxing, {
      type: "START",
      reward: ZODIAC[0],
    });
    expect(unboxingReducer(state, { type: "SKIP" })).toEqual({
      phase: "RESULT",
      reward: ZODIAC[0],
    });
  });
});
describe("persistent collection", () => {
  beforeEach(() => {
    localStorage.clear();
    useCollection.setState({
      counts: {},
      totalOpened: 0,
      effects: true,
      sound: false,
      storageError: false,
    });
  });
  it("counts duplicate wins and persists a versioned record", () => {
    useCollection.getState().recordWin("dragon");
    useCollection.getState().recordWin("dragon");
    expect(useCollection.getState().counts).toEqual({ dragon: 2 });
    const persisted = JSON.parse(localStorage.getItem(COLLECTION_KEY)!);
    expect(persisted.version).toBe(1);
    expect(persisted.state.counts.dragon).toBe(2);
  });
  it("rehydrates saved counts and ignores malformed values", async () => {
    localStorage.setItem(
      COLLECTION_KEY,
      JSON.stringify({
        version: 1,
        state: {
          counts: { rat: 3, pig: -1, snake: "bad", rabbit: 2.5, unknown: 10 },
          sound: true,
        },
      }),
    );
    await useCollection.persist.rehydrate();
    expect(useCollection.getState().counts).toEqual({ rat: 3 });
    expect(useCollection.getState().totalOpened).toBe(3);
    expect(useCollection.getState().sound).toBe(true);
  });
  it("recovers corrupt storage and resets all counts", async () => {
    localStorage.setItem(COLLECTION_KEY, "broken JSON");
    await useCollection.persist.rehydrate();
    expect(useCollection.getState().counts).toEqual({});
    useCollection.getState().recordWin("rabbit");
    useCollection.getState().reset();
    expect(useCollection.getState().counts).toEqual({});
    expect(useCollection.getState().totalOpened).toBe(0);
  });
  it("bounds unsafe counts and rejects non-object storage", () => {
    expect(validateCounts(null)).toEqual({});
    expect(validateCounts({ rat: Infinity, ox: 1e10, pig: 2 })).toEqual({
      ox: 999999,
      pig: 2,
    });
  });
});

it("keeps the session usable if browser storage rejects writes", async () => {
  const write = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Storage full");
    });
  useCollection.setState({ storageError: false });
  useCollection.getState().recordWin("pig");
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(useCollection.getState().storageError).toBe(true);
  expect(useCollection.getState().counts.pig).toBe(1);
  expect(write.mock.calls.length).toBeLessThan(5);
  write.mockRestore();
  useCollection.getState().reset();
});

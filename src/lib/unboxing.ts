import type { Zodiac } from "@/data/zodiac";
export type Phase =
  | "IDLE"
  | "SELECTING"
  | "ANTICIPATING"
  | "OPENING"
  | "REVEALING"
  | "CELEBRATING"
  | "RESULT"
  | "RESETTING";
export interface UnboxingState {
  phase: Phase;
  reward: Zodiac | null;
}
export type UnboxingAction =
  | { type: "START"; reward: Zodiac }
  | { type: "NEXT" }
  | { type: "SKIP" }
  | { type: "RESET" };
export const initialUnboxing: UnboxingState = { phase: "IDLE", reward: null };
const phases: Phase[] = [
  "SELECTING",
  "ANTICIPATING",
  "OPENING",
  "REVEALING",
  "CELEBRATING",
  "RESULT",
];
export function unboxingReducer(
  state: UnboxingState,
  action: UnboxingAction,
): UnboxingState {
  if (action.type === "START")
    return state.phase === "IDLE"
      ? { phase: "SELECTING", reward: action.reward }
      : state;
  if (action.type === "RESET")
    return state.phase === "RESULT" ? initialUnboxing : state;
  if (action.type === "SKIP")
    return state.reward ? { ...state, phase: "RESULT" } : state;
  const index = phases.indexOf(state.phase);
  return index >= 0 && index < phases.length - 1
    ? { ...state, phase: phases[index + 1] }
    : state;
}
export const PHASE_TIME: Partial<Record<Phase, number>> = {
  SELECTING: 350,
  ANTICIPATING: 950,
  OPENING: 1100,
  REVEALING: 1250,
  CELEBRATING: 650,
};

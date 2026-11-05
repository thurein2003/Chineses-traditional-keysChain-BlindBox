import { ZODIAC, type Zodiac } from "@/data/zodiac";
type FillRandom = (array: Uint32Array) => Uint32Array;
/** Rejection sampling removes modulo bias. Box position is intentionally irrelevant. */
export function randomIndex(
  length: number,
  fill: FillRandom = (a) => crypto.getRandomValues(a),
): number {
  if (!Number.isInteger(length) || length < 1 || length > 0x100000000)
    throw new RangeError("Invalid catalog size");
  const limit = Math.floor(0x100000000 / length) * length;
  const value = new Uint32Array(1);
  do {
    fill(value);
  } while (value[0] >= limit);
  return value[0] % length;
}
export function drawReward(): Zodiac {
  return ZODIAC[randomIndex(ZODIAC.length)];
}

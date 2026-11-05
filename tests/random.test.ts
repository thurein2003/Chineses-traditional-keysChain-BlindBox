import { describe, it, expect } from "vitest";
import { randomIndex, drawReward } from "@/lib/random";
import { ZODIAC } from "@/data/zodiac";
describe("unbiased cryptographic rewards", () => {
  it.each(Array.from({ length: 12 }, (_, i) => i))(
    "can obtain reward %i",
    (i) => {
      expect(
        randomIndex(12, (a) => {
          a[0] = i;
          return a;
        }),
      ).toBe(i);
    },
  );
  it("maps each complete residue block equally", () => {
    const counts = Array(12).fill(0);
    for (let n = 0; n < 1200; n++)
      counts[
        randomIndex(12, (a) => {
          a[0] = n;
          return a;
        })
      ]++;
    expect(counts).toEqual(Array(12).fill(100));
  });
  it("rejects the overflow tail instead of introducing modulo bias", () => {
    const draws = [0xffffffff, 0xfffffff0, 23];
    let calls = 0;
    const index = randomIndex(12, (a) => {
      a[0] = draws[calls++];
      return a;
    });
    expect(calls).toBe(2);
    expect(index).toBe(0);
  });
  it("never returns an out of range reward", () => {
    for (let n = 0; n < 1000; n++) {
      const result = drawReward();
      expect(ZODIAC).toContain(result);
    }
  });
  it.each([0, -1, 1.1, NaN, Infinity, 0x100000001])(
    "rejects invalid catalog size %s",
    (size) => {
      expect(() => randomIndex(size)).toThrow(RangeError);
    },
  );
});

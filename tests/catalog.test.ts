import { describe, it, expect } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import { ZODIAC, BOX_IMAGE } from "@/data/zodiac";
describe("original asset catalog", () => {
  it("preserves all thirteen exact case-sensitive filenames and valid original image bytes", async () => {
    const names = await readdir("public/assets/zodiac");
    const paths = [BOX_IMAGE, ...ZODIAC.map((a) => a.image)];
    expect(new Set(paths).size).toBe(13);
    await Promise.all(
      paths.map(async (path) => {
        expect(names).toContain(path.split("/").at(-1));
        const bytes = await readFile(`public${path}`);
        expect(
          (bytes[0] === 255 && bytes[1] === 216) ||
            bytes.toString("ascii", 0, 4) === "RIFF",
        ).toBe(true);
      }),
    );
  }, 60000);
  it("maps all twelve English names to the correct Chinese characters and source files", () => {
    expect(
      ZODIAC.map((a) => [a.name, a.chinese, a.image.split("/").at(-1)]),
    ).toEqual([
      ["Rat", "鼠", "mouse.jpg"],
      ["Ox", "牛", "Cow.jpg"],
      ["Tiger", "虎", "Tiger.jpg"],
      ["Rabbit", "兔", "rabbit.jpg"],
      ["Dragon", "龙", "Dragon.jpg"],
      ["Snake", "蛇", "Snake.jpg"],
      ["Horse", "马", "Horse.jpg"],
      ["Goat", "羊", "Sheep.jpg"],
      ["Monkey", "猴", "Monkey.jpg"],
      ["Rooster", "鸡", "Chicken.jpg"],
      ["Dog", "狗", "Dog.jpg"],
      ["Pig", "猪", "Pig.jpg"],
    ]);
  });
});

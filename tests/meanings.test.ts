import { describe, it, expect } from "vitest";
import { ZODIAC } from "@/data/zodiac";
import { ZODIAC_MEANINGS } from "@/data/zodiacMeanings";
describe("生肖文化图鉴", () => {
  it("十二地支与生肖逐一对应，图片和模型均绑定到同一生肖", () => {
    expect(ZODIAC_MEANINGS.map((m) => m.chineseName)).toEqual([
      "子鼠",
      "丑牛",
      "寅虎",
      "卯兔",
      "辰龙",
      "巳蛇",
      "午马",
      "未羊",
      "申猴",
      "酉鸡",
      "戌狗",
      "亥猪",
    ]);
    for (const animal of ZODIAC) {
      const m = animal.meaning;
      expect(m.id).toBe(animal.id);
      expect(m.imagePath).toBe(animal.image);
      expect(m.chineseCharacter).toBe(animal.chinese);
      expect(m.chineseName).toBe(m.earthlyBranch + m.chineseCharacter);
      expect(m.modelPath).toBe(`/models/${animal.id}.glb`);
      expect(m.collectionNumber).toBe(animal.collection.number);
    }
  });
  it.each(ZODIAC_MEANINGS)("$chineseName 有完整的中文寓意与祝福", (m) => {
    for (const text of [
      m.symbolicMeaning,
      m.personalityTraits,
      m.culturalExplanation,
      m.luckyBlessing,
    ]) {
      expect(text.length).toBeGreaterThan(7);
      expect(text).toMatch(/[\u4e00-\u9fff]/);
      expect(text).not.toMatch(/[A-Za-z]/);
    }
    expect(m.luckyBlessing).toMatch(/^愿你/);
  });
});

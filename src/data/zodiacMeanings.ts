import type { ZodiacId } from "./zodiac";
export interface ZodiacMeaning {
  id: ZodiacId;
  chineseName: string;
  earthlyBranch: string;
  chineseCharacter: string;
  symbolicMeaning: string;
  personalityTraits: string;
  culturalExplanation: string;
  luckyBlessing: string;
  imagePath: string;
  modelPath: string;
  collectionNumber: number;
}
const content: [
  ZodiacId,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
][] = [
  [
    "rat",
    "子",
    "鼠",
    "聪明机智、灵活敏锐",
    "机灵、善于观察、适应力强",
    "鼠位居十二生肖之首，常被赋予智慧、机敏与生命力旺盛的美好寓意。",
    "愿你聪明伶俐，好运连连，生活富足！",
    "mouse.jpg",
  ],
  [
    "ox",
    "丑",
    "牛",
    "勤劳踏实、坚韧不拔",
    "诚实、稳重、有耐心",
    "牛象征勤奋、力量与坚持，也代表脚踏实地、努力耕耘的精神。",
    "愿你牛气冲天，心想事成，幸福安康！",
    "Cow.jpg",
  ],
  [
    "tiger",
    "寅",
    "虎",
    "勇敢自信、威武有力",
    "勇敢、果断、充满活力",
    "虎在中国传统文化中象征勇气、力量和守护，也寄托着平安吉祥的愿望。",
    "愿你虎虎生威，勇往直前，平安顺遂！",
    "Tiger.jpg",
  ],
  [
    "rabbit",
    "卯",
    "兔",
    "温柔善良、平安幸福",
    "细心、温和、善解人意",
    "兔常与温柔、祥和及美好生活联系在一起，寄托着幸福安宁的祝愿。",
    "愿你前途似锦，平安喜乐，幸福美满！",
    "rabbit.jpg",
  ],
  [
    "dragon",
    "辰",
    "龙",
    "吉祥尊贵、力量与成功",
    "自信、热情、富有创造力",
    "龙是中国传统文化中的重要祥瑞形象，象征力量、兴旺和美好的祝福。",
    "愿你龙腾四海，事业顺利，万事兴旺！",
    "Dragon.jpg",
  ],
  [
    "snake",
    "巳",
    "蛇",
    "智慧灵动、沉着冷静",
    "敏锐、理性、善于思考",
    "蛇在部分中国传统文化表达中与智慧、灵性和生命更新联系在一起。",
    "愿你智慧常伴，顺心如意，好运不断！",
    "Snake.jpg",
  ],
  [
    "horse",
    "午",
    "马",
    "自由奔放、积极进取",
    "热情、独立、充满活力",
    "马象征速度、活力和奋斗精神，也寓意不断前进与事业成功。",
    "愿你马到成功，一路顺风，前程似锦！",
    "Horse.jpg",
  ],
  [
    "goat",
    "未",
    "羊",
    "温和善良、吉祥如意",
    "温柔、体贴、富有同情心",
    "羊在传统吉祥文化中常与温顺、和谐和美好祝福相联系。",
    "愿你三阳开泰，喜乐安康，生活美满！",
    "Sheep.jpg",
  ],
  [
    "monkey",
    "申",
    "猴",
    "聪慧灵巧、活泼乐观",
    "机智、幽默、富有创造力",
    "猴常象征机智、灵活和活力，也寄托着聪明快乐的愿望。",
    "愿你聪明过人，快乐无忧，好运常在！",
    "Monkey.jpg",
  ],
  [
    "rooster",
    "酉",
    "鸡",
    "勤奋守时、光明希望",
    "认真、自信、有责任心",
    "鸡鸣报晓象征新一天的到来，寓意勤奋、守时和充满希望的开始。",
    "愿你吉祥如意，前程光明，幸福常伴！",
    "Chicken.jpg",
  ],
  [
    "dog",
    "戌",
    "狗",
    "忠诚可靠、守护平安",
    "真诚、友善、富有责任感",
    "狗常被视为忠诚与守护的象征，代表友情、信任和家庭温暖。",
    "愿你平安幸福，友谊长存，好运相随！",
    "Dog.jpg",
  ],
  [
    "pig",
    "亥",
    "猪",
    "富足吉祥、幸福美满",
    "乐观、宽厚、真诚善良",
    "猪在传统吉祥文化中常象征富足、丰收和安逸幸福的生活。",
    "愿你福气满满，财运亨通，幸福美满！",
    "Pig.jpg",
  ],
];
/** Traditional symbolic associations, never birth-year personality predictions. */
export const ZODIAC_MEANINGS: readonly ZodiacMeaning[] = content.map(
  (
    [
      id,
      earthlyBranch,
      chineseCharacter,
      symbolicMeaning,
      personalityTraits,
      culturalExplanation,
      luckyBlessing,
      file,
    ],
    i,
  ) => ({
    id,
    chineseName: earthlyBranch + chineseCharacter,
    earthlyBranch,
    chineseCharacter,
    symbolicMeaning,
    personalityTraits,
    culturalExplanation,
    luckyBlessing,
    imagePath: `/assets/zodiac/${file}`,
    modelPath: `/models/${id}.glb`,
    collectionNumber: i + 1,
  }),
);
export const MEANING_BY_ID = Object.fromEntries(
  ZODIAC_MEANINGS.map((m) => [m.id, m]),
) as Record<ZodiacId, ZodiacMeaning>;

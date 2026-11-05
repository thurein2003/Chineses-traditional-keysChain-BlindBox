import { MEANING_BY_ID, type ZodiacMeaning } from "./zodiacMeanings";
export type ZodiacId =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";
export interface Zodiac {
  meaning: ZodiacMeaning;
  id: ZodiacId;
  chinese: string;
  name: string;
  image: string;
  viewer: {
    color: string;
    accent: string;
    modelPaths: readonly string[];
    scale: number;
  };
  collection: {
    number: number;
    series: string;
    trait: string;
    accessory: string;
    odds: string;
  };
}
const entries: [
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
    "鼠",
    "Rat",
    "mouse.jpg",
    "#aaa1b3",
    "#f3c0c9",
    "Clever & curious",
    "金元宝",
  ],
  [
    "ox",
    "牛",
    "Ox",
    "Cow.jpg",
    "#b97d51",
    "#edca9f",
    "Steady & kind",
    "福字锦囊",
  ],
  [
    "tiger",
    "虎",
    "Tiger",
    "Tiger.jpg",
    "#f0ac48",
    "#fff0cc",
    "Brave at heart",
    "吉祥锦鲤",
  ],
  [
    "rabbit",
    "兔",
    "Rabbit",
    "rabbit.jpg",
    "#f6d9dd",
    "#eca6b8",
    "Gentle & bright",
    "小胡萝卜",
  ],
  [
    "dragon",
    "龙",
    "Dragon",
    "Dragon.jpg",
    "#d5202f",
    "#f3ce75",
    "Born to sparkle",
    "如意珍珠",
  ],
  [
    "snake",
    "蛇",
    "Snake",
    "Snake.jpg",
    "#b5c8a0",
    "#f3dec3",
    "Wise & wonderful",
    "金色铃铛",
  ],
  [
    "horse",
    "马",
    "Horse",
    "Horse.jpg",
    "#b77b4a",
    "#76513e",
    "A free spirit",
    "金色马蹄铁",
  ],
  [
    "goat",
    "羊",
    "Goat",
    "Sheep.jpg",
    "#f7eee1",
    "#b78b70",
    "Soft & thoughtful",
    "福字锦囊",
  ],
  [
    "monkey",
    "猴",
    "Monkey",
    "Monkey.jpg",
    "#af7950",
    "#edc6a7",
    "Playfully clever",
    "金色香蕉",
  ],
  [
    "rooster",
    "鸡",
    "Rooster",
    "Chicken.jpg",
    "#fff0df",
    "#df3a48",
    "Rise & shine",
    "金元宝",
  ],
  [
    "dog",
    "狗",
    "Dog",
    "Dog.jpg",
    "#e7bc7c",
    "#ac6b3b",
    "Your loyal friend",
    "小骨头",
  ],
  [
    "pig",
    "猪",
    "Pig",
    "Pig.jpg",
    "#f2b9c4",
    "#df899f",
    "A heart of gold",
    "福字锦囊",
  ],
];
export const ZODIAC: readonly Zodiac[] = entries.map(
  ([id, chinese, name, , color, accent, , accessory], i) => ({
    id,
    meaning: MEANING_BY_ID[id],
    chinese,
    name,
    image: MEANING_BY_ID[id].imagePath,
    viewer: {
      color,
      accent,
      modelPaths: [`/models/${id}.glb`, `/models/${id}.gltf`],
      scale: 1,
    },
    collection: {
      number: i + 1,
      series: "十二生肖 · 纳福珍藏 · 第一辑",
      trait: MEANING_BY_ID[id].personalityTraits,
      accessory,
      odds: "十二分之一",
    },
  }),
);
export const BOX_IMAGE = "/assets/zodiac/Box.jpg";
export const ZODIAC_BY_ID = Object.fromEntries(
  ZODIAC.map((animal) => [animal.id, animal]),
) as Record<ZodiacId, Zodiac>;

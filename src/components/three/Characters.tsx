"use client";
import type { Zodiac } from "@/data/zodiac";
import ZodiacRat from "./ZodiacRat";
import ZodiacOx from "./ZodiacOx";
import ZodiacTiger from "./ZodiacTiger";
import ZodiacRabbit from "./ZodiacRabbit";
import ZodiacDragon from "./ZodiacDragon";
import ZodiacSnake from "./ZodiacSnake";
import ZodiacHorse from "./ZodiacHorse";
import ZodiacGoat from "./ZodiacGoat";
import ZodiacMonkey from "./ZodiacMonkey";
import ZodiacRooster from "./ZodiacRooster";
import ZodiacDog from "./ZodiacDog";
import ZodiacPig from "./ZodiacPig";
const characters = {
  rat: ZodiacRat,
  ox: ZodiacOx,
  tiger: ZodiacTiger,
  rabbit: ZodiacRabbit,
  dragon: ZodiacDragon,
  snake: ZodiacSnake,
  horse: ZodiacHorse,
  goat: ZodiacGoat,
  monkey: ZodiacMonkey,
  rooster: ZodiacRooster,
  dog: ZodiacDog,
  pig: ZodiacPig,
};
export default function Character({ animal }: { animal: Zodiac }) {
  const Toy = characters[animal.id];
  return <Toy />;
}

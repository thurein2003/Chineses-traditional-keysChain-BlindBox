"use client";
import type { ThreeElements } from "@react-three/fiber";
import { ZODIAC_BY_ID } from "@/data/zodiac";
import PlushCharacter from "./PlushCharacter";
export default function ZodiacTiger(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <PlushCharacter animal={ZODIAC_BY_ID.tiger} />
    </group>
  );
}

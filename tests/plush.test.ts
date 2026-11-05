import { describe, it, expect } from "vitest";
import {
  createPlushGeometry,
  type Profile,
} from "@/components/three/PlushMaterials";
describe("毛绒曲面与纤维几何", () => {
  it.each(["head", "body", "paw", "ear", "muzzle", "leaf"] as Profile[])(
    "%s 曲面与绒毛没有无效坐标，并能独立回收",
    (profile) => {
      const { body, fur } = createPlushGeometry(
        [0.66, 0.59, 0.49],
        profile,
        250,
        0.02,
      );
      for (const geometry of [body, fur]) {
        const positions = geometry.getAttribute("position");
        expect(positions.count).toBeGreaterThan(1000);
        expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
        expect(
          Array.from(geometry.getAttribute("normal").array).every(
            Number.isFinite,
          ),
        ).toBe(true);
        geometry.computeBoundingBox();
        expect(geometry.boundingBox!.min.y).toBeGreaterThan(-0.7);
        expect(geometry.boundingBox!.max.y).toBeLessThan(0.7);
        geometry.dispose();
      }
      expect(body.type).toBe("BufferGeometry");
      expect(fur.index!.count).toBe(250 * 12);
    },
  );
});

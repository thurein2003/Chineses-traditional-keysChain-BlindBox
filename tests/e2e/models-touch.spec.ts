import { test, expect } from "@playwright/test";
import { writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";

test("GLB takes priority and both supplied GLB and GLTF load correctly", async ({
  page,
  request,
}) => {
  const path = "public/models/rat.gltf";
  test.skip(
    existsSync(path) || existsSync("public/models/rat.glb"),
    "Preserve supplied user models.",
  );
  const bytes = Buffer.concat([
    Buffer.from(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0, 1, 0]).buffer),
    Buffer.from(new Uint16Array([0, 1, 2]).buffer),
  ]);
  const gltf = {
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }],
      },
    ],
    materials: [
      {
        doubleSided: true,
        pbrMetallicRoughness: {
          baseColorFactor: [0.8, 0.1, 0.2, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8,
        },
      },
    ],
    buffers: [
      {
        uri: `data:application/octet-stream;base64,${bytes.toString("base64")}`,
        byteLength: bytes.length,
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 6 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [-0.5, 0, 0],
        max: [0.5, 1, 0],
      },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    ],
  };
  let jsonCreated = false,
    binaryCreated = false;
  try {
    await writeFile(path, JSON.stringify(gltf), { flag: "wx" });
    jsonCreated = true;
    const json = Buffer.from(
      JSON.stringify({ ...gltf, buffers: [{ byteLength: bytes.length }] }),
    );
    const jsonChunk = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
    json.copy(jsonChunk);
    const binChunk = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
    bytes.copy(binChunk);
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546c67, 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(28 + jsonChunk.length + binChunk.length, 8);
    const jh = Buffer.alloc(8);
    jh.writeUInt32LE(jsonChunk.length, 0);
    jh.writeUInt32LE(0x4e4f534a, 4);
    const bh = Buffer.alloc(8);
    bh.writeUInt32LE(binChunk.length, 0);
    bh.writeUInt32LE(0x004e4942, 4);
    await writeFile(
      "public/models/rat.glb",
      Buffer.concat([header, jh, jsonChunk, bh, binChunk]),
      { flag: "wx" },
    );
    binaryCreated = true;
    expect((await (await request.get("/api/models")).json()).rat).toBe(
      "/models/rat.glb",
    );
    await page.goto("/collection");
    await page.getByRole("button", { name: "查看子鼠", exact: true }).click();
    const binaryLoaded = page.waitForResponse(
      (r) => r.url().endsWith("/models/rat.glb") && r.status() === 200,
    );
    await page.getByRole("tab", { name: "3D立体展示" }).click();
    await binaryLoaded;
    await expect(page.locator(".model-caption")).toHaveText(
      "外部精细模型 · 原始材质",
    );
    await page.getByRole("button", { name: "关闭生肖展示" }).click();
    await unlink("public/models/rat.glb");
    binaryCreated = false;
    expect((await (await request.get("/api/models")).json()).rat).toBe(
      "/models/rat.gltf",
    );
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/collection");
    await page.getByRole("button", { name: "查看子鼠", exact: true }).click();
    const loaded = page.waitForResponse(
      (r) => r.url().endsWith("/models/rat.gltf") && r.status() === 200,
    );
    await page.getByRole("tab", { name: "3D立体展示" }).click();
    await loaded;
    await expect(page.locator(".viewer-stage canvas")).toBeVisible();
    await expect(page.locator(".model-caption")).toHaveText(
      "外部精细模型 · 原始材质",
    );
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  } finally {
    if (jsonCreated) await unlink(path).catch(() => {});
    if (binaryCreated) await unlink("public/models/rat.glb").catch(() => {});
  }
  expect((await (await request.get("/api/models")).json()).rat).toBeNull();
});

test("mobile touch swipe, single-finger orbit, and two-finger pinch work", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage(),
    session = await context.newCDPSession(page);
  const touch = async (
    type: "touchStart" | "touchMove" | "touchEnd",
    points: { x: number; y: number }[],
  ) =>
    session.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p, i) => ({
        ...p,
        id: i,
        radiusX: 3,
        radiusY: 3,
        force: 1,
      })),
    });
  try {
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await touch("touchStart", [{ x: 270, y: 450 }]);
    await touch("touchMove", [{ x: 210, y: 450 }]);
    await touch("touchMove", [{ x: 110, y: 450 }]);
    await touch("touchEnd", []);
    await expect(page.getByTestId("carousel")).toHaveAttribute(
      "data-selected",
      "2",
    );
    await page.goto("/collection");
    await page.getByRole("button", { name: "查看辰龙", exact: true }).click();
    await page.getByRole("tab", { name: "3D立体展示" }).click();
    await expect(page.locator(".viewer-stage canvas")).toBeVisible();
    await page.getByRole("button", { name: "自动旋转：开启" }).click();
    const canvas = page.locator(".viewer-stage canvas"),
      bounds = (await canvas.boundingBox())!,
      x = bounds.x + bounds.width / 2,
      y = bounds.y + bounds.height / 2;
    await page.waitForTimeout(700);
    const before = await canvas.screenshot();
    await touch("touchStart", [{ x: x - 50, y }]);
    await touch("touchMove", [{ x: x + 20, y: y + 10 }]);
    await touch("touchMove", [{ x: x + 90, y: y + 20 }]);
    await touch("touchEnd", []);
    await page.waitForTimeout(500);
    const rotated = await canvas.screenshot();
    expect(Buffer.compare(before, rotated)).not.toBe(0);
    await touch("touchStart", [
      { x: x - 35, y },
      { x: x + 35, y },
    ]);
    await touch("touchMove", [
      { x: x - 60, y },
      { x: x + 60, y },
    ]);
    await touch("touchMove", [
      { x: x - 95, y },
      { x: x + 95, y },
    ]);
    await touch("touchEnd", []);
    await page.waitForTimeout(500);
    expect(Buffer.compare(rotated, await canvas.screenshot())).not.toBe(0);
  } finally {
    await context.close();
  }
});

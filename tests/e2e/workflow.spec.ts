import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});
const catalog = [
  ["子鼠", "鼠", "mouse.jpg"],
  ["丑牛", "牛", "Cow.jpg"],
  ["寅虎", "虎", "Tiger.jpg"],
  ["卯兔", "兔", "rabbit.jpg"],
  ["辰龙", "龙", "Dragon.jpg"],
  ["巳蛇", "蛇", "Snake.jpg"],
  ["午马", "马", "Horse.jpg"],
  ["未羊", "羊", "Sheep.jpg"],
  ["申猴", "猴", "Monkey.jpg"],
  ["酉鸡", "鸡", "Chicken.jpg"],
  ["戌狗", "狗", "Dog.jpg"],
  ["亥猪", "猪", "Pig.jpg"],
];
async function draw(page: Page) {
  await page.getByRole("button", { name: "开启幸运盲盒", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "你的生肖惊喜" }),
  ).toBeVisible();
}
test("all 13 original paths resolve as JPEGs with correct capitalization", async ({
  request,
}) => {
  for (const filename of ["Box.jpg", ...catalog.map((a) => a[2])]) {
    const response = await request.get(`/assets/zodiac/${filename}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\/(jpeg|webp)/);
    const bytes = await response.body();
    expect(bytes.equals(readFileSync(`public/assets/zodiac/${filename}`))).toBe(
      true,
    );
  }
});
test("carousel arrows, keyboard, drag, dots and trackpad change box selection", async ({
  page,
}) => {
  await page.goto("/");
  const carousel = page.getByTestId("carousel");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "下一个盲盒" }).click();
  await expect(carousel).toHaveAttribute("data-selected", "2");
  await page.getByRole("button", { name: "上一个盲盒" }).click();
  await expect(carousel).toHaveAttribute("data-selected", "1");
  await page.locator("h1").click();
  await page.keyboard.press("ArrowLeft");
  await expect(carousel).toHaveAttribute("data-selected", "12");
  await page
    .getByRole("button", { name: "选择第5个盲盒", exact: true })
    .click();
  await expect(carousel).toHaveAttribute("data-selected", "5");
  const bounds = await carousel.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width / 2,
    y = bounds!.y + bounds!.height / 2;
  await page.mouse.move(x + 70, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 10 });
  await page.mouse.up();
  await expect(carousel).toHaveAttribute("data-selected", "6");
  await page.mouse.wheel(100, 0);
  await expect(carousel).toHaveAttribute("data-selected", "7");
});
test("full animated opening locks duplicate input, opens lid, and raises matching photo", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "开启幸运盲盒", exact: true }).click();
  await expect(page.getByTestId("carousel")).toHaveAttribute(
    "data-phase",
    "ANTICIPATING",
  );
  await expect(page.getByRole("button", { name: "下一个盲盒" })).toBeDisabled();
  await expect(page.getByTestId("carousel")).toHaveAttribute(
    "data-phase",
    "OPENING",
  );
  await expect(page.locator(".rising-photo img")).toBeVisible();
  const path = await page.locator(".rising-photo img").getAttribute("src");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".reward-photo")).toHaveAttribute("src", path!);
  await page.getByRole("button", { name: "加入我的收藏" }).click();
  await expect(
    page.getByRole("button", { name: "已加入我的收藏" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "查看3D模型" }).click();
  await expect(page.getByRole("tab", { name: "3D立体展示" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".viewer-stage canvas")).toBeVisible();
  await page.getByRole("tab", { name: "实物照片" }).click();
  await expect(page.locator(".original-photo")).toHaveAttribute("src", path!);
  await page.getByRole("button", { name: "关闭生肖展示" }).click();
  await page.getByRole("button", { name: "再开一个盲盒" }).click();
  await expect(page.getByTestId("carousel")).toHaveAttribute(
    "data-phase",
    "IDLE",
  );
  await draw(page);
  expect(errors).toEqual([]);
});
test("all 12 rewards are obtainable and persist once, including duplicate wins", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    let i = 0;
    crypto.getRandomValues = ((array: Uint32Array) => {
      array.fill(i++ % 12);
      return array;
    }) as typeof crypto.getRandomValues;
  });
  await page.goto("/");
  for (const [name, chinese, file] of catalog) {
    await draw(page);
    await expect(page.getByRole("status")).toHaveText(`你抽中了【${name}】！`);
    await expect(page.locator(".reward-photo")).toHaveAttribute(
      "src",
      `/assets/zodiac/${file}`,
    );
    await expect(page.locator(".reward-name > span")).toHaveText(chinese);
    await page.getByRole("button", { name: "加入我的收藏" }).click();
    await page.getByRole("button", { name: "再开一个盲盒" }).click();
  }
  await draw(page);
  await expect(page.getByRole("status")).toHaveText("你抽中了【子鼠】！");
  await page.getByRole("button", { name: "加入我的收藏" }).click();
  await page.getByRole("button", { name: "关闭中奖卡" }).click();
  await page
    .locator(".site-header")
    .getByRole("link", { name: /我的生肖收藏/ })
    .click();
  await expect(page.locator(".collectible-card.unlocked")).toHaveCount(12);
  await expect(
    page.locator(".collectible-card").first().locator(".times-won strong"),
  ).toHaveText("2");
  await page.reload();
  await expect(page.locator(".collectible-card.unlocked")).toHaveCount(12);
  await expect(page.locator(".progress-summary")).toContainText(
    "累计收获 13 次惊喜",
  );
});
test("all 12 procedural models load and original photos match", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/collection");
  for (const [name, , file] of catalog) {
    await page
      .getByRole("button", { name: `查看${name}`, exact: true })
      .click();
    await expect(page.locator(".original-photo")).toHaveAttribute(
      "src",
      `/assets/zodiac/${file}`,
    );
    await page.getByRole("tab", { name: "3D立体展示" }).click();
    await expect(page.locator(".viewer-stage canvas")).toBeVisible();
    await expect(page.locator(".model-caption")).toContainText(
      "毛绒工艺模型 · 程序化演绎",
    );
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "关闭生肖展示" }).click();
  }
  expect(errors).toEqual([]);
});
test('3D viewer orbit, zoom, reset and fullscreen work',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/collection');
  await page.getByRole("button", { name: "查看辰龙", exact: true }).click();
  await page.getByRole("tab", { name: "3D立体展示" }).click();
  await expect(page.locator(".viewer-stage canvas")).toBeVisible();
  await page.getByRole("button", { name: "自动旋转：开启" }).click();
  const canvas = page.locator(".viewer-stage canvas"),
    bounds = (await canvas.boundingBox())!;
  await page.waitForTimeout(1000);
  const before = await canvas.screenshot();
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 140,
    bounds.y + bounds.height / 2 + 30,
    { steps: 15 },
  );
  await page.mouse.up();
  await page.waitForTimeout(700);
  const after = await canvas.screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  await page.mouse.wheel(0, -250);
  await page.waitForTimeout(500);
  expect(Buffer.compare(after, await canvas.screenshot())).not.toBe(0);
  await page.getByRole("button", { name: "重置视角" }).click();
  await page.getByRole("button", { name: "全屏查看" }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "关闭生肖展示" }).click();
  expect(errors).toEqual([]);
});
test("collection filters, malformed storage and confirmed reset work", async ({
  page,
}) => {
  await page.goto("/collection");
  await page.evaluate(() =>
    localStorage.setItem("lucky-twelve-collection", "corrupt"),
  );
  await page.reload();
  await expect(page.locator(".collectible-card.locked")).toHaveCount(12);
  await page.getByRole("button", { name: "已解锁" }).click();
  await expect(page.getByText("你的第一份生肖好运，正在等你。")).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "lucky-twelve-collection",
      JSON.stringify({
        version: 1,
        state: { counts: { dragon: 2 }, effects: true, sound: false },
      }),
    ),
  );
  await page.reload();
  await expect(page.locator(".collectible-card.unlocked")).toHaveCount(1);
  await page.getByRole("button", { name: "已解锁" }).click();
  await expect(page.locator(".collectible-card")).toHaveCount(1);
  await page.getByRole("button", { name: "重置生肖收藏", exact: true }).click();
  await page.getByRole("button", { name: "保留我的收藏" }).click();
  await expect(page.locator(".collectible-card")).toHaveCount(1);
  await page.getByRole("button", { name: "重置生肖收藏", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "重置生肖收藏", exact: true })
    .click();
  await page.getByRole("button", { name: "全部生肖" }).click();
  await expect(page.locator(".collectible-card.locked")).toHaveCount(12);
  await page.reload();
  await expect(page.locator(".collectible-card.unlocked")).toHaveCount(0);
});
for (const [width, height] of [
  [375, 812],
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
])
  test(`responsive workflow at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "开启幸运盲盒", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await draw(page);
    await expect(page.locator(".reward-photo")).toBeVisible();
    await page
      .getByRole("button", { name: "再开一个盲盒" })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "再开一个盲盒" }),
    ).toBeInViewport();
    await page.getByRole("button", { name: "关闭中奖卡" }).click();
    await page.goto("/collection");
    await expect(page.locator(".collectible-card")).toHaveCount(12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("WebGL unavailable uses original-photo fallback and still completes unboxing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByText("实物照片模式 · 当前设备无法显示立体图形"),
  ).toBeVisible();
  await draw(page);
  await page.getByRole("button", { name: "查看3D模型" }).click();
  await expect(
    page.getByText("当前设备无法显示立体模型", { exact: false }),
  ).toBeVisible();
});

test("saved sound and effects settings hydrate without console errors", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "lucky-twelve-collection",
      JSON.stringify({
        version: 1,
        state: { counts: { rat: 1 }, sound: true, effects: false },
      }),
    ),
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "关闭音效" })).toBeVisible();
  await expect(page.getByRole("button", { name: "开启动效" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    page.locator(".site-header").getByRole("link", { name: /我的生肖收藏/ }),
  ).toContainText("1/12");
});

test("全中文页面、文化卡和辅助标签都使用正确生肖数据", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const assertChinese = async () => {
    const values = await page.evaluate(() => [
      document.title,
      document.body.innerText,
      ...Array.from(
        document.querySelectorAll("[aria-label],[alt],[title]"),
      ).flatMap((el) =>
        ["aria-label", "alt", "title"].map((key) => el.getAttribute(key) ?? ""),
      ),
    ]);
    expect(values.join("\n").replaceAll("3D", "")).not.toMatch(/[A-Za-z]/);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  };
  await page.goto("/");
  await assertChinese();
  await draw(page);
  await assertChinese();
  const name = await page.locator(".reward-name strong").textContent();
  await expect(page.locator(".cultural-details")).toContainText(name!);
  for (const label of [
    "生肖名称",
    "象征寓意",
    "性格特征",
    "文化含义",
    "幸运祝福",
  ])
    await expect(page.locator(".cultural-details")).toContainText(label);
  await page.getByRole("button", { name: "查看3D模型" }).click();
  await expect(page.locator(".viewer-stage canvas")).toBeVisible();
  await assertChinese();
  await page.getByRole("tab", { name: "实物照片" }).click();
  await assertChinese();
  await page.getByRole("button", { name: "关闭生肖展示" }).click();
  await page.getByRole("button", { name: "关闭中奖卡" }).click();
  await page.goto("/collection");
  await assertChinese();
  const missing = await page.request.get("/missing-zodiac-page");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("这份惊喜还没找到");
});

test("中文分享文案与手机设置可用", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    }),
  );
  await draw(page);
  const name = await page.locator(".reward-name strong").textContent();
  await page.getByRole("button", { name: "分享好运", exact: true }).click();
  await expect(page.getByText("好运文案已复制")).toBeVisible();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain(`【${name}】`);
  expect(shared).toContain("愿你");
  await page.getByRole("button", { name: "关闭中奖卡" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("显示设置").click();
  await page.getByRole("button", { name: "开启音效", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "关闭音效", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "减少动态效果", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "开启动效", exact: true }),
  ).toBeVisible();
});

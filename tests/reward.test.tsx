import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Reward from "@/components/Reward";
import { ZODIAC } from "@/data/zodiac";
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
afterEach(cleanup);
describe("reward presentation", () => {
  it.each(ZODIAC)(
    "shows the matching original photograph and Chinese character for $name",
    (animal) => {
      render(
        <Reward
          animal={animal}
          saved={false}
          onSave={() => {}}
          onAnother={() => {}}
          onView={() => {}}
          onClose={() => {}}
          effects={false}
        />,
      );
      expect(screen.getByRole("img")).toHaveAttribute("src", animal.image);
      expect(screen.getByRole("status")).toHaveTextContent(
        `你抽中了【${animal.meaning.chineseName}】！`,
      );
      expect(screen.getByText(animal.meaning.symbolicMeaning)).toBeVisible();
      expect(
        screen.getByText(animal.meaning.culturalExplanation),
      ).toBeVisible();
      expect(screen.getByText(animal.meaning.luckyBlessing)).toBeVisible();
    },
  );
  it("offers working save, view, and repeat controls", () => {
    const save = vi.fn(),
      view = vi.fn(),
      another = vi.fn();
    render(
      <Reward
        animal={ZODIAC[3]}
        saved={false}
        onSave={save}
        onAnother={another}
        onView={view}
        onClose={() => {}}
        effects={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "加入我的收藏" }));
    fireEvent.click(screen.getByRole("button", { name: "查看3D模型" }));
    fireEvent.click(screen.getByRole("button", { name: "再开一个盲盒" }));
    expect(save).toHaveBeenCalledOnce();
    expect(view).toHaveBeenCalledOnce();
    expect(another).toHaveBeenCalledOnce();
  });
});

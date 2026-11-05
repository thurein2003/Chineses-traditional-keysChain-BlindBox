"use client";
import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Camera,
  Box,
  X,
  RotateCcw,
  Expand,
  Rotate3D,
  Check,
  ZoomIn,
  Move,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Zodiac } from "@/data/zodiac";
import { useCollection } from "@/stores/collection";
import Modal from "./Modal";
import CulturalDetails from "./CulturalDetails";
const ToyScene = dynamic(() => import("./three/ToyScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">正在布置毛绒萌宠展台…</div>,
});
export default function Viewer({
  animal,
  onClose,
  initialTab = "photo",
}: {
  animal: Zodiac;
  onClose: () => void;
  initialTab?: "photo" | "3d";
}) {
  const [tab, setTab] = useState(initialTab),
    [auto, setAuto] = useState(true),
    [reset, setReset] = useState(0),
    [kind, setKind] = useState("毛绒工艺模型 · 程序化演绎"),
    [expanded, setExpanded] = useState(false);
  const effects = useCollection((s) => s.effects),
    reduced = useReducedMotion(),
    wrapper = useRef<HTMLDivElement>(null);
  const setModelKind = useCallback((s: string) => setKind(s), []);
  const fullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    if (wrapper.current?.requestFullscreen) {
      try {
        await wrapper.current.requestFullscreen();
      } catch {
        setExpanded((s) => !s);
      }
    } else setExpanded((s) => !s);
  };
  return (
    <Modal
      onClose={onClose}
      label={`${animal.meaning.chineseName}生肖展示`}
      className={`viewer-modal collectible-viewer ${expanded ? "expanded" : ""}`}
    >
      <div ref={wrapper} className="viewer-inner">
        <header className="viewer-header">
          <div>
            <span className="eyebrow">遇见你的专属幸运萌宠</span>
            <h2>
              {animal.meaning.chineseName}
              <span>生肖纳福 · 第一辑</span>
            </h2>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="关闭生肖展示"
          >
            <X />
          </button>
        </header>
        <div className="viewer-layout">
          <div className="viewer-display">
            <div
              className="viewer-tabs"
              role="tablist"
              aria-label="生肖展示方式"
            >
              <button
                id="photo-tab"
                role="tab"
                aria-selected={tab === "photo"}
                aria-controls="toy-panel"
                onClick={() => setTab("photo")}
              >
                <Camera size={16} />
                实物照片
              </button>
              <button
                id="model-tab"
                role="tab"
                aria-selected={tab === "3d"}
                aria-controls="toy-panel"
                onClick={() => setTab("3d")}
              >
                <Box size={16} />
                3D立体展示
              </button>
            </div>
            <div
              id="toy-panel"
              className="viewer-stage"
              role="tabpanel"
              aria-labelledby={tab === "photo" ? "photo-tab" : "model-tab"}
            >
              {tab === "photo" ? (
                <>
                  <img
                    className="original-photo"
                    src={animal.image}
                    alt={`${animal.meaning.chineseName}毛绒钥匙扣原始实物照片`}
                    loading="eager"
                  />
                  <span className="photo-caption">
                    <Check size={13} />
                    原始实物照片 · 保留全部细节
                  </span>
                </>
              ) : (
                <>
                  <ToyScene
                    key={animal.id}
                    animal={animal}
                    autoRotate={auto}
                    reset={reset}
                    reduced={Boolean(reduced) || !effects}
                    onModelKind={setModelKind}
                  />
                  <span className="model-caption">{kind}</span>
                </>
              )}
              <button
                className="fullscreen-button"
                aria-label={expanded ? "退出全屏" : "全屏查看"}
                title="全屏查看"
                onClick={() => void fullscreen()}
              >
                <Expand size={18} />
              </button>
            </div>
            {tab === "3d" ? (
              <div className="viewer-tools">
                <button onClick={() => setAuto(!auto)} aria-pressed={auto}>
                  <Rotate3D size={17} />
                  自动旋转：{auto ? "开启" : "关闭"}
                </button>
                <button onClick={() => setReset((n) => n + 1)}>
                  <RotateCcw size={16} />
                  重置视角
                </button>
                <span>
                  <Move size={14} />
                  拖动旋转 <ZoomIn size={14} />
                  双指缩放或滚轮缩放
                </span>
              </div>
            ) : (
              <div className="photo-note">
                一针一线，细节如初。切换立体展示，欣赏毛绒萌宠的另一面。
              </div>
            )}
          </div>
          <aside className="viewer-culture">
            <div className="culture-title">
              <span>{animal.chinese}</span>
              <div>
                <small>十二生肖 · 文化图鉴</small>
                <h3>{animal.meaning.chineseName}</h3>
              </div>
            </div>
            <CulturalDetails meaning={animal.meaning} compact />
            {tab === "3d" && (
              <p className="model-honesty">
                {kind.includes("程序化")
                  ? "根据实物照片创作的程序化模型，并非实物扫描；隐藏结构与布料细节为艺术化演绎。"
                  : "优先展示已提供的外部模型，保留模型原有材质与纹理。"}
              </p>
            )}
          </aside>
        </div>
        <footer className="viewer-footer">
          <span>{animal.meaning.symbolicMeaning}</span>
          <span>
            图鉴 {String(animal.collection.number).padStart(2, "0")} / 12 ·
            纳福珍藏
          </span>
        </footer>
      </div>
    </Modal>
  );
}

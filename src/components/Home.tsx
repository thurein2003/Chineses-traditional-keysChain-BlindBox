"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Box,
  ShieldCheck,
  MoveHorizontal,
} from "lucide-react";
import Header, { useHydrated } from "./Header";
import { ZODIAC, type Zodiac } from "@/data/zodiac";
import { drawReward } from "@/lib/random";
import { initialUnboxing, PHASE_TIME, unboxingReducer } from "@/lib/unboxing";
import { useCollection } from "@/stores/collection";
import { playChime } from "@/lib/sound";
import Reward from "./Reward";
import Viewer from "./Viewer";
const Carousel = dynamic(() => import("./three/BoxCarousel"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span className="loading-orbit" />
      正在准备一份惊喜…
    </div>
  ),
});
export default function Home() {
  const [selected, setSelected] = useState(0),
    [state, dispatch] = useReducer(unboxingReducer, initialUnboxing),
    [saved, setSaved] = useState(false),
    [viewing, setViewing] = useState<Zodiac | null>(null),
    [viewerTab, setViewerTab] = useState<"photo" | "3d">("photo");
  const { effects, sound, recordWin, counts, storageError } = useCollection();
  const reducedMotion = useReducedMotion(),
    hydrated = useHydrated(),
    reduced = hydrated && (Boolean(reducedMotion) || !effects);
  const openingLock = useRef(false),
    savedRef = useRef(false),
    drag = useRef<{ x: number; y: number } | null>(null),
    wheelTime = useRef(0),
    suppressClick = useRef(0);
  const { phase, reward } = state,
    active = phase !== "IDLE",
    result = phase === "RESULT";
  const select = useCallback((n: number) => {
    if (!openingLock.current) setSelected((n + 12) % 12);
  }, []);
  const navigate = useCallback((step: number) => {
    if (!openingLock.current) setSelected((n) => (n + step + 12) % 12);
  }, []);
  const open = useCallback(() => {
    if (openingLock.current) return;
    openingLock.current = true;
    savedRef.current = false;
    setSaved(false);
    const animal = drawReward();
    dispatch({ type: "START", reward: animal });
    if (sound) playChime();
  }, [sound]);
  useEffect(() => {
    const duration = PHASE_TIME[phase];
    if (!duration) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "NEXT" }),
      reduced ? 75 : duration,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        active ||
        viewing ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLButtonElement
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, viewing, navigate]);
  const save = useCallback(() => {
    if (reward && !savedRef.current) {
      savedRef.current = true;
      recordWin(reward.id);
      setSaved(true);
    }
  }, [recordWin, reward]);
  const another = useCallback(() => {
    save();
    dispatch({ type: "RESET" });
    openingLock.current = false;
    setViewing(null);
  }, [save]);
  const closeViewer = useCallback(() => setViewing(null), []);
  const celebrating = ["REVEALING", "CELEBRATING"].includes(phase);
  const revealText = {
    SELECTING: "你的幸运盲盒已就位…",
    ANTICIPATING: "好运正在悄悄酝酿…",
    OPENING: "藏在盒中的惊喜即将揭晓…",
    REVEALING: "遇见你的专属幸运萌宠！",
    CELEBRATING: "这份好运，属于你！",
    RESULT: "你的生肖惊喜",
    RESETTING: "再遇一份小惊喜",
    IDLE: "",
  }[phase];
  return (
    <main
      className={`home ${active ? "is-opening" : ""} ${reduced ? "reduce-effects" : ""}`}
    >
      <div className="festive-backdrop" aria-hidden="true">
        <div className="celestial-ring ring-one" />
        <div className="celestial-ring ring-two" />
        <div className="celestial-ring ring-three" />
        <div className="cloud cloud-left" />
        <div className="cloud cloud-right" />
        {Array.from({ length: 18 }, (_, i) => (
          <i
            key={i}
            className="gold-mote"
            style={{
              left: `${(i * 37 + 9) % 100}%`,
              top: `${(i * 19 + 12) % 87}%`,
              animationDelay: `${i * -0.7}s`,
            }}
          />
        ))}
      </div>
      <Header />
      <section className="hero" aria-labelledby="hero-title">
        <div className="edition-pill">
          <span /> 十二生肖 · 纳福珍藏 <b>·</b> 第一辑
        </div>
        <h1 id="hero-title">
          一盒惊喜，
          <br className="mobile-break" /> <em>满心欢喜。</em>
        </h1>
        <p>
          十二生肖，十二份美好寓意。
          <br className="mobile-break" /> 哪一份好运，会与你相遇？
        </p>
      </section>
      <section className="unboxing-section" aria-label="挑选你的幸运盲盒">
        <div className="scene-side left-side">
          <span className="tiny-star">✦</span>
          <strong>十二生肖</strong>
          <small>
            十二生肖，
            <br />
            珍藏每一份欢喜。
          </small>
          <span className="side-rule" />
        </div>
        <div
          className="carousel-stage"
          data-testid="carousel"
          data-selected={selected + 1}
          data-phase={phase}
          onPointerDownCapture={(e) => {
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUpCapture={(e) => {
            if (!drag.current) return;
            const dx = e.clientX - drag.current.x,
              dy = e.clientY - drag.current.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
              suppressClick.current = Date.now() + 350;
              navigate(dx < 0 ? 1 : -1);
            }
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onClickCapture={(e) => {
            if (Date.now() < suppressClick.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onWheel={(e) => {
            if (
              Math.abs(e.deltaX) > 25 &&
              Date.now() - wheelTime.current > 380
            ) {
              navigate(e.deltaX > 0 ? 1 : -1);
              wheelTime.current = Date.now();
            }
          }}
        >
          <div className="scene-glow" />
          <div className="pedestal">
            <span />
          </div>
          <Carousel
            selected={selected}
            phase={phase}
            reduced={reduced}
            onSelect={select}
            onOpen={open}
          />
          {celebrating && reward && (
            <motion.div
              className="rising-photo"
              initial={
                reduced
                  ? false
                  : { y: 140, scale: 0.25, opacity: 0, rotate: -6 }
              }
              animate={{ y: -70, scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, duration: 1 }}
            >
              <img
                src={reward.image}
                alt={`生肖${reward.chinese}从盲盒中升起`}
              />
              <span>{reward.meaning.chineseName}</span>
            </motion.div>
          )}
        </div>
        <div className="scene-side right-side">
          <span className="tiny-star">✦</span>
          <strong>
            把美好
            <br />
            <em>藏进小小盲盒。</em>
          </strong>
          <small>
            让每一次相遇
            <br />
            都有值得珍藏的惊喜。
          </small>
          <span className="side-rule" />
        </div>
        <button
          className="carousel-arrow previous"
          disabled={active}
          aria-label="上一个盲盒"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="carousel-arrow next"
          disabled={active}
          aria-label="下一个盲盒"
          onClick={() => navigate(1)}
        >
          <ChevronRight size={22} />
        </button>
      </section>
      <section className="opening-controls">
        <div className="carousel-position">
          <span className="position-line" />
          <span>
            第 <b>{String(selected + 1).padStart(2, "0")}</b> / 12
          </span>
          <span className="position-line" />
        </div>
        <div className="carousel-dots" aria-label="盲盒位置">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              aria-label={`选择第${i + 1}个盲盒`}
              aria-current={i === selected ? "true" : undefined}
              onClick={() => select(i)}
              disabled={active}
            />
          ))}
        </div>
        <p className="swipe-hint">
          {active ? (
            <span role={result ? undefined : "status"}>{revealText}</span>
          ) : (
            <>
              <MoveHorizontal size={15} />
              左右滑动，挑选你的幸运盲盒
            </>
          )}
        </p>
        <button
          className="primary-button open-button"
          disabled={active}
          onClick={open}
        >
          <Sparkles size={19} />
          {active ? "好运正在开启…" : "开启幸运盲盒"}
          {!active && <ArrowRight size={19} />}
        </button>
        {active && !result ? (
          <button
            className="skip-button"
            onClick={() => dispatch({ type: "SKIP" })}
          >
            直接揭晓惊喜 <ArrowRight size={12} />
          </button>
        ) : (
          <p className="odds-note">
            <ShieldCheck size={13} />
            十二生肖等概率出现，每个盲盒都有惊喜。
          </p>
        )}
      </section>
      <section
        className="collection-preview"
        aria-labelledby="collection-title"
      >
        <div className="preview-heading">
          <div>
            <span className="eyebrow">小小萌宠，藏着满满祝福。</span>
            <h2 id="collection-title">
              遇见十二生肖<span>十二生肖</span>
            </h2>
          </div>
          <Link href="/collection">
            探索生肖收藏
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="preview-track">
          {ZODIAC.map((animal) => (
            <button
              key={animal.id}
              className="preview-card"
              onClick={() => {
                setViewerTab("photo");
                setViewing(animal);
              }}
              aria-label={`预览${animal.meaning.chineseName}`}
            >
              <span className="card-no">
                {String(animal.collection.number).padStart(2, "0")}
              </span>
              <img
                src={animal.image}
                alt={`${animal.meaning.chineseName}毛绒钥匙扣实物照片`}
                loading="lazy"
              />
              <span className="preview-name">
                {animal.meaning.chineseName}
                <b lang="zh">{animal.chinese}</b>
              </span>
              {hydrated && counts[animal.id] && (
                <span className="mini-owned">已解锁</span>
              )}
            </button>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <span>
          <Box size={15} /> 愿这份好运，与你常伴。
        </span>
        <span>十二生肖 · 纳福珍藏 · 虚拟盲盒体验</span>
        <Link href="/collection">
          我的生肖收藏 <ArrowRight size={13} />
        </Link>
      </footer>
      {storageError && (
        <p className="storage-warning" role="alert">
          Device storage is unavailable. 我的生肖收藏 will last for this
          session.
        </p>
      )}
      {result && reward && !viewing && (
        <Reward
          animal={reward}
          saved={saved}
          onSave={save}
          onAnother={another}
          onView={() => {
            setViewerTab("3d");
            setViewing(reward);
          }}
          onClose={another}
          effects={!reduced}
        />
      )}
      {viewing && (
        <Viewer animal={viewing} initialTab={viewerTab} onClose={closeViewer} />
      )}
    </main>
  );
}

"use client";
import Link from "next/link";
import {
  Box,
  Grid2X2,
  Volume2,
  VolumeX,
  Sparkles,
  Settings2,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { useCollection } from "@/stores/collection";
const subscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
export default function Header({
  collection = false,
}: {
  collection?: boolean;
}) {
  const { counts, sound, setSound, effects, setEffects } = useCollection();
  const hydrated = useHydrated();
  const count = hydrated ? Object.keys(counts).length : 0;
  const soundOn = hydrated && sound;
  const effectsOn = !hydrated || effects;
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="十二生肖盲盒首页">
        <span className="brand-icon">
          <Box size={27} strokeWidth={1.25} />
        </span>
        <span>
          <strong>十二生肖盲盒</strong>
          <small>十二生肖 · 纳福珍藏</small>
        </span>
      </Link>
      <nav aria-label="主导航">
        <details className="mobile-settings">
          <summary aria-label="显示设置">
            <Settings2 size={17} />
          </summary>
          <div>
            <strong>显示与音效</strong>
            <button onClick={() => setSound(!sound)}>
              {soundOn ? "关闭音效" : "开启音效"}
            </button>
            <button onClick={() => setEffects(!effects)}>
              {effectsOn ? "减少动态效果" : "开启动效"}
            </button>
          </div>
        </details>
        <button
          className="icon-button desktop-control"
          aria-label={soundOn ? "关闭音效" : "开启音效"}
          title={soundOn ? "音效已开启" : "音效已关闭"}
          onClick={() => setSound(!sound)}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          className={`icon-button desktop-control ${!effectsOn ? "muted" : ""}`}
          aria-label={effectsOn ? "减少动态效果" : "开启动效"}
          aria-pressed={effectsOn}
          title="切换动态效果"
          onClick={() => setEffects(!effects)}
        >
          <Sparkles size={18} />
        </button>
        <Link
          href={collection ? "/" : "/collection"}
          className="collection-link"
        >
          <Grid2X2 size={16} />
          <span>{collection ? "返回盲盒" : "我的生肖收藏"}</span>
          {!collection && (
            <b>
              {count}
              <span>/12</span>
            </b>
          )}
        </Link>
      </nav>
    </header>
  );
}

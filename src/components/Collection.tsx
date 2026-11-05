"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Trash2,
  Box,
  X,
} from "lucide-react";
import Header, { useHydrated } from "./Header";
import Viewer from "./Viewer";
import Modal from "./Modal";
import { ZODIAC, type Zodiac } from "@/data/zodiac";
import { useCollection } from "@/stores/collection";
export default function Collection() {
  const { counts, reset, storageError } = useCollection(),
    hydrated = useHydrated();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all"),
    [viewer, setViewer] = useState<Zodiac | null>(null),
    [confirm, setConfirm] = useState(false);
  const closeViewer = useCallback(() => setViewer(null), []),
    closeConfirm = useCallback(() => setConfirm(false), []);
  const safeCounts = hydrated ? counts : {},
    unlocked = Object.keys(safeCounts).length,
    total = Object.values(safeCounts).reduce((a, b) => a + (b ?? 0), 0);
  const filtered = ZODIAC.filter(
    (a) =>
      filter === "all" ||
      (filter === "unlocked" ? Boolean(safeCounts[a.id]) : !safeCounts[a.id]),
  );
  return (
    <main className="collection-page">
      <Header collection />
      <section className="collection-intro">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} />
          返回幸运盲盒
        </Link>
        <span className="eyebrow">把十二份祝福，珍藏在心里</span>
        <h1>
          十二生肖，
          <br />
          <em>珍藏一份好运。</em>
        </h1>
        <p>每一个生肖，都有专属的文化寓意；每一次相遇，都是一份美好祝福。</p>
        <div className="progress-summary">
          <span>
            <strong>{unlocked}</strong> / 12 已解锁
          </span>
          <span>累计收获 {total} 次惊喜</span>
        </div>
        <div
          className="collection-progress"
          role="progressbar"
          aria-valuenow={unlocked}
          aria-valuemin={0}
          aria-valuemax={12}
          aria-label="生肖收集进度"
        >
          <i style={{ width: `${(unlocked / 12) * 100}%` }} />
        </div>
      </section>
      <section className="collection-body">
        <div className="collection-toolbar">
          <div className="filter-tabs" role="group" aria-label="筛选生肖收藏">
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f === "all"
                  ? "全部生肖"
                  : f === "unlocked"
                    ? "已解锁"
                    : "尚未解锁"}
                <span>
                  {f === "all"
                    ? 12
                    : f === "unlocked"
                      ? unlocked
                      : 12 - unlocked}
                </span>
              </button>
            ))}
          </div>
          <span className="series-label">十二生肖 · 纳福珍藏 · 第一辑</span>
        </div>
        <div className="collection-grid">
          {filtered.map((animal) => {
            const count = safeCounts[animal.id] ?? 0;
            return (
              <article
                className={`collectible-card ${count ? "unlocked" : "locked"}`}
                key={animal.id}
              >
                <div className="collectible-photo">
                  <span className="card-no">
                    图鉴编号 {String(animal.collection.number).padStart(2, "0")}
                  </span>
                  <img
                    src={animal.image}
                    alt={`${animal.meaning.chineseName}毛绒钥匙扣实物照片`}
                    loading="lazy"
                  />
                  <span className={`status-tag ${count ? "owned" : ""}`}>
                    {count ? <Check size={12} /> : <LockKeyhole size={12} />}
                    {count ? "已解锁" : "尚未解锁"}
                  </span>
                  <button
                    className="card-view-button"
                    onClick={() => setViewer(animal)}
                    aria-label={`查看${animal.meaning.chineseName}`}
                  >
                    <Box size={16} />
                    探索生肖
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div className="collectible-details">
                  <div>
                    <h2>{animal.meaning.chineseName}</h2>
                    <span lang="zh">{animal.chinese}</span>
                  </div>
                  <p>{animal.meaning.symbolicMeaning}</p>
                  <div className="times-won">
                    <span>获得次数</span>
                    <strong>{count}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <div className="empty-collection">
            <Box size={40} strokeWidth={1} />
            <h2>你的第一份生肖好运，正在等你。</h2>
            <p>开启一个盲盒，让好运与你相遇。</p>
            <Link className="primary-button" href="/">
              开启幸运盲盒
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
        <div className="collection-bottom">
          <p>收藏已保存在当前设备的浏览器中。</p>
          <button
            className="text-button reset-collection"
            disabled={!total}
            onClick={() => setConfirm(true)}
          >
            <Trash2 size={14} />
            重置生肖收藏
          </button>
        </div>
        {storageError && (
          <p role="alert">当前设备无法保存收藏，进度将暂存于本次会话。</p>
        )}
      </section>
      <footer className="site-footer">
        <span>愿这份好运，与你常伴。</span>
        <Link href="/">
          寻找下一份生肖好运 <ArrowRight size={14} />
        </Link>
      </footer>
      {viewer && <Viewer animal={viewer} onClose={closeViewer} />}
      {confirm && (
        <Modal
          onClose={closeConfirm}
          label="重置生肖收藏"
          className="confirm-modal"
        >
          <button
            className="close-button"
            aria-label="取消重置"
            onClick={closeConfirm}
          >
            <X />
          </button>
          <Trash2 size={30} />
          <h2>开启全新的收藏旅程？</h2>
          <p>重置后，本设备已保存的 {total} 次生肖收藏将被移除。</p>
          <button
            className="danger-button"
            onClick={() => {
              reset();
              setConfirm(false);
            }}
          >
            重置生肖收藏
          </button>
          <button className="secondary-button" onClick={closeConfirm}>
            保留我的收藏
          </button>
        </Modal>
      )}
    </main>
  );
}

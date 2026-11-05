"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Box,
  Check,
  ArrowRight,
  BookmarkPlus,
  Share2,
  X,
  Sparkles,
  Mail,
} from "lucide-react";
import type { Zodiac } from "@/data/zodiac";
import Modal from "./Modal";
import CulturalDetails from "./CulturalDetails";
export default function Reward({
  animal,
  saved,
  onSave,
  onAnother,
  onView,
  onClose,
  effects,
}: {
  animal: Zodiac;
  saved: boolean;
  onSave: () => void;
  onAnother: () => void;
  onView: () => void;
  onClose: () => void;
  effects: boolean;
}) {
  const [shared, setShared] = useState("");
  const meaning = animal.meaning;
  useEffect(() => {
    if (!effects) return;
    const fire = (x: number) =>
      void confetti({
        particleCount: 45,
        spread: 100,
        origin: { x, y: 0.4 },
        colors: ["#f7cd77", "#fff1c4", "#cb3c43"],
        disableForReducedMotion: true,
        ticks: 130,
        gravity: 0.8,
      });
    fire(0.17);
    fire(0.83);
    const timer = window.setTimeout(() => {
      fire(0.25);
      fire(0.75);
    }, 700);
    return () => {
      window.clearTimeout(timer);
      confetti.reset();
    };
  }, [effects]);
  const share = async () => {
    const text = `我在十二生肖盲盒中抽中了【${meaning.chineseName}】！${meaning.luckyBlessing} 一起来珍藏生肖好运吧！`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "分享我的生肖好运",
          text,
          url: location.origin,
        });
      else {
        await navigator.clipboard.writeText(text + " " + location.origin);
        setShared("好运文案已复制");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setShared("暂时无法分享，请稍后重试");
    }
  };
  return (
    <Modal
      label="你的生肖惊喜"
      onClose={onClose}
      className="reward-modal cultural-reward"
    >
      <button
        className="close-button"
        aria-label="关闭中奖卡"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <header className="reward-heading">
        <span className="eyebrow">
          <Sparkles size={14} />
          生肖纳福 · 好运相逢
        </span>
        <h2>恭喜你！</h2>
        <p className="winner-message" role="status">
          你抽中了【{meaning.chineseName}】！
        </p>
      </header>
      <div className="reward-photo-wrap">
        <div className="reward-halo" />
        <div className="photo-gold-frame">
          <motion.img
            initial={effects ? { y: 45, opacity: 0, scale: 0.88 } : false}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 18 }}
            src={animal.image}
            alt={`抽中的生肖${animal.chinese}毛绒钥匙扣实物照片`}
            className="reward-photo"
          />
        </div>
        <span className="reward-number">
          纳福图鉴 · {String(meaning.collectionNumber).padStart(2, "0")} / 12
        </span>
        <span className="reward-seal" aria-hidden="true">
          <Mail size={18} />
          <b>福</b>
        </span>
      </div>
      <div className="reward-copy">
        <div className="reward-name">
          <span>{animal.chinese}</span>
          <div>
            <strong>{meaning.chineseName}</strong>
            <small>{animal.collection.series}</small>
          </div>
        </div>
        <CulturalDetails meaning={meaning} />
      </div>
      <div className="reward-actions">
        <button className="primary-button reward-primary" onClick={onView}>
          <Box size={17} />
          查看3D模型
          <ArrowRight size={16} />
        </button>
        <button
          className="secondary-button save-button"
          onClick={onSave}
          disabled={saved}
        >
          {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
          {saved ? "已加入我的收藏" : "加入我的收藏"}
        </button>
        <button className="secondary-button" onClick={() => void share()}>
          <Share2 size={16} />
          分享好运
        </button>
        <button className="secondary-button another-button" onClick={onAnother}>
          再开一个盲盒
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="reward-bottom">
        <span>虚拟生肖收藏 · 不涉及实物奖品</span>
        <span aria-live="polite">{shared}</span>
      </div>
    </Modal>
  );
}

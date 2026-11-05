"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="simple-message">
      <h1>惊喜暂时迷路了</h1>
      <p>页面未能正常加载，请稍后重试。</p>
      <button className="primary-button" onClick={reset}>
        重新加载
      </button>
      <Link href="/">返回幸运盲盒</Link>
    </main>
  );
}

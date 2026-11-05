import Link from "next/link";
export default function NotFound() {
  return (
    <main className="simple-message">
      <span>十二生肖 · 纳福珍藏</span>
      <h1>这份惊喜还没找到</h1>
      <p>页面可能已移动，回到首页继续寻找生肖好运吧。</p>
      <Link className="primary-button" href="/">
        返回幸运盲盒
      </Link>
    </main>
  );
}

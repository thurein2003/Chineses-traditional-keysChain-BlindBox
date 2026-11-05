import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "十二生肖盲盒｜一盒惊喜，满心欢喜",
  description:
    "开启十二生肖纳福盲盒，遇见专属幸运萌宠。欣赏实物照片与毛绒立体模型，了解传统生肖文化，珍藏每一份美好祝福。",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#791424",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

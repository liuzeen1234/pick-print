import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// 全站通用 metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PickPrint — 选模打印",
    template: "%s | PickPrint",
  },
  description: "挑一个模型，下单，我们帮你打印出来。3D 打印定制下单平台。",
  openGraph: {
    title: "PickPrint — 选模打印",
    description: "挑一个模型，下单，我们帮你打印出来。3D 打印定制下单平台。",
    url: siteUrl,
    siteName: "PickPrint",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

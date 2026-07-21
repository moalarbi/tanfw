import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "وُصُول كونسيرج | الشراكة التشغيلية التقنية الاستراتيجية",
  description:
    "وثيقة استراتيجية عربية للشراكة التشغيلية التقنية بين التنفيذي ووُصُول كونسيرج.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

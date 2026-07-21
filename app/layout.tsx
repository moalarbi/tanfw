import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOSOL Concierge | Strategic Tech-Enabled Operating Partnership",
  description:
    "Arabic RTL executive strategy document for ALTANFEETHI and WOSOL Concierge.",
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

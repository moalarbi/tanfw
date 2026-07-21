import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        <Script id="force-scroll-top" strategy="beforeInteractive">
          {`
            try {
              if ("scrollRestoration" in window.history) {
                window.history.scrollRestoration = "manual";
              }

              var scrollToTop = function () {
                window.scrollTo(0, 0);
              };

              scrollToTop();
              window.addEventListener("pageshow", scrollToTop);
              window.addEventListener("load", scrollToTop);
            } catch (error) {}
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

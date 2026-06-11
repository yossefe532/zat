import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { FaqSidebar } from "@/components/FaqSidebar";

const kufaFont = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-initiative-body",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "ZAT Initiative - منحة ZAT التعليمية",
  description: "انضم لأقوى مجتمع تعليمي في مصر، واستمتع بمزايا حصرية لا تقبل المنافسة مع أفضل الخبراء والمدربين المعتمدين.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className={`${kufaFont.className} ${kufaFont.variable} min-h-screen flex flex-col antialiased`}>
        {children}
        <FaqSidebar />
      </body>
    </html>
  );
}

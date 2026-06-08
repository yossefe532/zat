import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
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
      <body className={`${cairo.variable} font-sans min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const initiativeFont = localFont({
  src: "../../Abdoullah-Ashgar-EL-kharef.ttf",
  variable: "--font-initiative",
  display: "swap",
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
      <body className={`${initiativeFont.variable} font-sans min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}

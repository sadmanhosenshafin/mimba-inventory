import type { Metadata, Viewport } from "next";
import { Anek_Bangla, Noto_Sans_Bengali } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-anek-bangla",
  display: "swap"
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MIMBA",
  description: "বাংলা-প্রথম ফিড ডিলার স্টক ব্যবস্থাপনা"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f6b43"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${anekBangla.variable} ${notoSansBengali.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

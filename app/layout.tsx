import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import MotionProvider from "@/components/shell/MotionProvider";
import { APP_NAME, LOCALE } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Track your income and expenses and visualize your money.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={LOCALE} className={inter.variable}>
      <body className="font-sans">
        <StoreProvider>
          <MotionProvider>{children}</MotionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

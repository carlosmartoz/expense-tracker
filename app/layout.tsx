import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { APP_NAME, LOCALE } from "@/lib/config";

// Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Metadata
export const metadata: Metadata = {
  title: APP_NAME,
  description: "Track your income and expenses and visualize your money.",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={LOCALE} className={inter.variable}>
      <body className="font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

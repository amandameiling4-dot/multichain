import type { Metadata } from "next";
import "./globals.css";
import GlobalChat from "@/components/GlobalChat";

export const metadata: Metadata = {
  title: "MultiChain — Real-Time Trading Dapp",
  description:
    "Real-time multi-chain trading data dashboard with admin control panel. Powered by Next.js, Neon Postgres, and Prisma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <GlobalChat />
      </body>
    </html>
  );
}

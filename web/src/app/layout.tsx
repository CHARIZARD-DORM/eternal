import type { Metadata } from "next";
import { Bungee_Shade, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConnectButton } from "@/components/connect-button";

const bungeeShade = Bungee_Shade({ weight: "400", subsets: ["latin"], variable: "--font-heading" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Eternal | On-Chain Battle Game",
  description: "A competitive on-chain game where players submit Solidity smart contracts as fighters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${bungeeShade.variable} ${montserrat.variable} font-[family-name:var(--font-body)] bg-black text-white min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <header className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur z-50">
            <h1 className="text-2xl font-[family-name:var(--font-heading)] tracking-widest text-white">
              ETERNAL
            </h1>
            <nav className="flex gap-6 items-center">
              <a href="/" className="hover:text-white/60 font-medium transition-colors text-white/80">Home</a>
              <a href="/arena" className="hover:text-white/60 font-medium transition-colors text-white/80">Arena</a>
              <a href="/leaderboard" className="hover:text-white/60 font-medium transition-colors text-white/80">Leaderboard</a>
              <a href="/profile" className="hover:text-white/60 font-medium transition-colors text-white/80">Profile</a>
            </nav>
            <ConnectButton />
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

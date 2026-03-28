"use client";

import { useEffect } from "react";
import { WagmiProvider, createConfig, http, useDisconnect } from "wagmi";
import { monadTestnet, hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Explicit Monad Testnet config as requested in the spec
const monadTestnetConfig = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
} as const;

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [monadTestnetConfig as any],
    transports: {
      // RPC URL for each chain
      [monadTestnetConfig.id]: http(monadTestnetConfig.rpcUrls.default.http[0]),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo_project_id",

    // Required App Info
    appName: "Eternal",
    appDescription: "The On-Chain Fighter Game",
    appUrl: "https://eternal-game.xyz",
    appIcon: "https://eternal-game.xyz/logo.png",
  }),
);

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark">
            <AutoDisconnect />
            {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

function AutoDisconnect() {
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // Check if this is a fresh tab/session OR if 30 minutes have passed since last activity
    const isNewSession = !sessionStorage.getItem("eternal_session_active");
    const lastActive = localStorage.getItem("eternal_last_active");
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    if (isNewSession || (!lastActive || now - parseInt(lastActive) > THIRTY_MINUTES)) {
      disconnect();
    }
    
    // Mark as active session
    sessionStorage.setItem("eternal_session_active", "true");
    
    // Maintain last active timestamp heartbeat
    const updateTime = () => localStorage.setItem("eternal_last_active", Date.now().toString());
    updateTime();
    
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [disconnect]);

  return null;
}

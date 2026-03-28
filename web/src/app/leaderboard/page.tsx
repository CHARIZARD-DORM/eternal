"use client";

import { useAccount, useReadContract } from "wagmi";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LEADERBOARD_ADDRESS, LeaderboardABI } from "@/lib/contracts";

export default function LeaderboardPage() {
  const { address } = useAccount();

  // Fetch top 50 players
  const { data: topPlayersRaw } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: "getTopPlayers",
    args: [BigInt(50)],
    query: {
      refetchInterval: 10000, // Poll every 10 seconds
    }
  }) as any;

  const getSlots = (rank: number) => {
    if (rank <= 50) return 1;
    if (rank <= 100) return 2;
    if (rank <= 200) return 3;
    return 4;
  };

  const players = Array.isArray(topPlayersRaw) ? topPlayersRaw
    .filter((p: any) => p && p.player !== "0x0000000000000000000000000000000000000000")
    .map((p: any) => ({
      rank: Number(p.rank),
      player: p.player,
      points: Number(p.points),
      slots: getSlots(Number(p.rank)),
      isCurrentUser: p.player.toLowerCase() === address?.toLowerCase(),
    }))
    .sort((a, b) => a.rank - b.rank) : [];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-heading)] tracking-widest text-white uppercase">
          Hall of Fame
        </h1>
        <p className="text-white/40 text-lg uppercase tracking-widest">Global Top 50 Fighters</p>
      </div>

      <LeaderboardTable players={players} />
    </div>
  );
}

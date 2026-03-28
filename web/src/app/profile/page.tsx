"use client";

import { useAccount, useReadContract } from "wagmi";
import { LEADERBOARD_ADDRESS, LeaderboardABI } from "@/lib/contracts";
import { User, Trophy, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  const { data: points } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: "points",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  const { data: rank } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: "getRank",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  const { data: slots } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LeaderboardABI,
    functionName: "getAbilitySlots",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white/40">Please connect your wallet to view your profile.</h2>
      </div>
    );
  }

  const userPoints = points ? Number(points) : 0;
  const userRank = rank ? Number(rank) : 0;
  const userSlots = slots ? Number(slots) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center flex-shrink-0 z-10">
          <User className="w-10 h-10 text-white/40" />
        </div>
        
        <div className="z-10">
          <h1 className="text-3xl font-[family-name:var(--font-heading)] text-white tracking-widest uppercase flex items-center gap-3">
            Warrior Profile
          </h1>
          <p className="text-white/60 font-mono mt-1 text-sm bg-white/5 px-3 py-1 rounded inline-block">
            {address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Trophy className="w-8 h-8 text-white/60 mb-3" />
          <span className="text-white/40 text-sm font-bold tracking-widest uppercase">Global Rank</span>
          <span className="text-3xl font-black text-white">{userRank > 0 ? `#${userRank}` : "Unranked"}</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Activity className="w-8 h-8 text-white/60 mb-3" />
          <span className="text-white/40 text-sm font-bold tracking-widest uppercase">Total Points</span>
          <span className="text-3xl font-black text-white">{userPoints} pts</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Star className="w-8 h-8 text-white/60 mb-3" />
          <span className="text-white/40 text-sm font-bold tracking-widest uppercase">Ability Slots</span>
          <div className="flex gap-1 mt-1 text-white">
            {userSlots > 0 ? (
               [...Array(userSlots)].map((_, i) => <Star key={i} className="w-5 h-5 fill-white/20" />)
            ) : (
              <span className="text-xl font-black">0</span>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

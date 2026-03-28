"use client";

import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";

interface PlayerRank {
  rank: number;
  player: string;
  points: number;
  slots: number;
  isCurrentUser: boolean;
}

interface LeaderboardTableProps {
  players: PlayerRank[];
}

export function LeaderboardTable({ players }: LeaderboardTableProps) {
  return (
    <div className="w-full relative shadow-2xl rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
      
      <div className="relative z-10 w-full text-left">
        <div className="grid grid-cols-5 bg-black p-4 border-b border-white/10 text-white/40 font-bold tracking-widest uppercase text-xs">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-2">Warrior Wallet</div>
          <div className="col-span-1 text-right">Points</div>
          <div className="col-span-1 text-center">Ability Slots</div>
        </div>

        <div className="flex flex-col">
          {players.length === 0 ? (
            <div className="p-8 text-center text-white/30 italic">No warriors ranked yet.</div>
          ) : (
            players.map((p, i) => {
              const rowClass = p.isCurrentUser
                ? "bg-white/10 hover:bg-white/15"
                : "hover:bg-white/5";

              return (
                <motion.div
                  key={p.player}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={"grid grid-cols-5 p-4 border-b border-white/5 items-center transition-colors " + rowClass}
                >
                  <div className="col-span-1 flex justify-center">
                    {p.rank === 1 ? (
                      <Trophy className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                    ) : p.rank === 2 ? (
                      <Trophy className="w-5 h-5 text-white/60" />
                    ) : p.rank === 3 ? (
                      <Trophy className="w-5 h-5 text-white/40" />
                    ) : (
                      <span className="text-white/30 font-bold font-mono text-lg">{p.rank}</span>
                    )}
                  </div>
                  
                  <div className="col-span-2 font-mono text-sm tracking-widest text-white/70 flex items-center gap-2">
                    {p.player.substring(0, 6)}...{p.player.substring(p.player.length - 4)}
                    {p.isCurrentUser && <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-black uppercase">You</span>}
                  </div>
                  
                  <div className="col-span-1 text-right font-black text-white text-lg">
                    {p.points}
                  </div>
                  
                  <div className="col-span-1 flex justify-center items-center gap-1">
                    {[...Array(p.slots)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-white fill-white/20" />
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

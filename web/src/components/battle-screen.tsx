"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FighterCard } from "./fighter-card";
import { usePublicClient } from "wagmi";
import { BATTLE_ARENA_ADDRESS, BattleArenaABI } from "@/lib/contracts";
import { Clock } from "lucide-react";

interface FighterParams {
  address: string;
  name: string;
  maxHealth: number;
  attack: number;
  defense: number;
  specialAbility: number;
  codeScore: number;
}

interface BattleScreenProps {
  battleId: bigint;
  player1Fighter: FighterParams;
  player2Fighter: FighterParams;
  onComplete: (winner: string) => void;
}

interface Round {
  round: number;
  p1Health: number;
  p2Health: number;
  p1Damage: number;
  p2Damage: number;
}

export function BattleScreen({ battleId, player1Fighter, player2Fighter, onComplete }: BattleScreenProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [activeAttacker, setActiveAttacker] = useState<1 | 2 | null>(null);
  const [showResult, setShowResult] = useState<"P1" | "P2" | null>(null);
  const [forfeitWinner, setForfeitWinner] = useState<"P1" | "P2" | null>(null);
  
  const [p1CurrentHealth, setP1CurrentHealth] = useState(player1Fighter.maxHealth);
  const [p2CurrentHealth, setP2CurrentHealth] = useState(player2Fighter.maxHealth);

  const [p1FloatingDmg, setP1FloatingDmg] = useState<number | null>(null);
  const [p2FloatingDmg, setP2FloatingDmg] = useState<number | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!publicClient) return;
      try {
        const blockNumber = await publicClient.getBlockNumber();
        const fromBlockNum = blockNumber > BigInt(80) ? blockNumber - BigInt(80) : BigInt(0);

        const roundLogs = await publicClient.getContractEvents({
          address: BATTLE_ARENA_ADDRESS,
          abi: BattleArenaABI,
          eventName: "RoundComplete",
          args: { battleId: battleId },
          fromBlock: fromBlockNum,
          toBlock: "latest"
        });
        
        const r = roundLogs.map((log: any) => ({
             round: Number(log.args.round),
             p1Health: Number(log.args.fighter1Health),
             p2Health: Number(log.args.fighter2Health),
             p1Damage: Number(log.args.damageDealtP1),
             p2Damage: Number(log.args.damageDealtP2),
        }));
        setRounds(r);
        
        const completeLogs = await publicClient.getContractEvents({
          address: BATTLE_ARENA_ADDRESS,
          abi: BattleArenaABI,
          eventName: "BattleComplete",
          args: { battleId: battleId },
          fromBlock: fromBlockNum,
          toBlock: "latest"
        });

        if (completeLogs.length > 0) {
          const finalRound = Number(completeLogs[0].args.finalRound);
          const winnerAddress = completeLogs[0].args.winner;
          if (finalRound === 0) {
            const isP1Winner = winnerAddress === player1Fighter.address;
            setForfeitWinner(isP1Winner ? "P1" : "P2");
            setShowResult(isP1Winner ? "P1" : "P2");
             // Force health to 0 for loser visually
            if (isP1Winner) setP2CurrentHealth(0);
            else setP1CurrentHealth(0);
          }
        }
        
      } catch (e) {
        console.error("Failed to fetch battle logs:", e);
      }
    };
    fetchHistory();
  }, [battleId, publicClient]);

  // Animation sequencer
  useEffect(() => {
    if (rounds.length > currentRound) {
      const nextRound = rounds[currentRound];

      const sequence = async () => {
        setActiveAttacker(1);
        await new Promise(r => setTimeout(r, 600));
        
        setP2FloatingDmg(nextRound.p1Damage);
        setP2CurrentHealth(prev => Math.max(0, prev - nextRound.p1Damage));
        await new Promise(r => setTimeout(r, 800));
        setP2FloatingDmg(null);
        setActiveAttacker(null);
        
        if (nextRound.p2Health === 0) {
          setCurrentRound(prev => prev + 1);
          setP2CurrentHealth(0);
          setTimeout(() => setShowResult("P1"), 1500);
          return;
        }

        await new Promise(r => setTimeout(r, 400));

        setActiveAttacker(2);
        await new Promise(r => setTimeout(r, 600));
        
        setP1FloatingDmg(nextRound.p2Damage);
        setP1CurrentHealth(prev => Math.max(0, prev - nextRound.p2Damage));
        await new Promise(r => setTimeout(r, 800));
        setP1FloatingDmg(null);
        setActiveAttacker(null);

        if (nextRound.p1Health === 0) {
          setCurrentRound(prev => prev + 1);
          setP1CurrentHealth(0);
          setTimeout(() => setShowResult("P2"), 1500);
          return;
        }

        setCurrentRound(prev => prev + 1);
      };

      sequence();
    }
  }, [rounds, currentRound]);

  // Triggers end of match
  useEffect(() => {
    if (showResult) {
      setTimeout(() => {
        onComplete(showResult === "P1" ? player1Fighter.address : player2Fighter.address);
      }, 5000);
    }
  }, [showResult, onComplete, player1Fighter.address, player2Fighter.address]);

  const p1SpecialGlow = p1CurrentHealth < (player1Fighter.maxHealth * 0.3);
  const p2SpecialGlow = p2CurrentHealth < (player2Fighter.maxHealth * 0.3);

  return (
    <div className="flex flex-col items-center w-full space-y-12">
      <div className="flex justify-between items-center w-full max-w-5xl relative px-10">
        
        {/* P1 Side */}
        <div className="relative">
          <FighterCard 
            stats={{...player1Fighter, health: player1Fighter.maxHealth}} 
            currentHealth={p1CurrentHealth}
            isAttacking={activeAttacker === 1}
            isDefending={activeAttacker === 2}
            isSpecial={p1SpecialGlow}
          />
          <AnimatePresence>
            {p1FloatingDmg !== null && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -100, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
              >
                -{p1FloatingDmg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center VS */}
        <div className="flex flex-col items-center justify-center shrink-0 w-64 z-50 relative">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div 
                key="vs"
                exit={{ opacity: 0, scale: 0 }}
                animate={{ scale: activeAttacker ? 1.2 : 1 }}
                className="text-6xl font-[family-name:var(--font-heading)] text-white/30 italic tracking-tighter"
              >
                VS
              </motion.div>
            ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.2, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col items-center absolute"
                >
                  <div className="text-4xl text-center font-[family-name:var(--font-heading)] tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                    {showResult === "P1" ? `${player1Fighter.name} WINS` : `${player2Fighter.name} WINS`}
                  </div>
                  <div className="text-white/60 font-bold uppercase tracking-widest mt-4">
                    {forfeitWinner ? "Opponent Forfeited" : "Match Concluded"}
                  </div>
                </motion.div>
            )}
           </AnimatePresence>

          {!showResult && activeAttacker === 1 && <span className="text-white font-bold tracking-widest uppercase mt-4 animate-pulse absolute -bottom-10">Attack →</span>}
          {!showResult && activeAttacker === 2 && <span className="text-white font-bold tracking-widest uppercase mt-4 animate-pulse absolute -bottom-10">← Attack</span>}
        </div>

        {/* P2 Side */}
        <div className="relative">
          <FighterCard 
            stats={{...player2Fighter, health: player2Fighter.maxHealth}} 
            currentHealth={p2CurrentHealth}
            isAttacking={activeAttacker === 2}
            isDefending={activeAttacker === 1}
            isSpecial={p2SpecialGlow}
          />
          <AnimatePresence>
            {p2FloatingDmg !== null && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -100, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
              >
                -{p2FloatingDmg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Round Logs */}
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-xl p-4 h-48 overflow-y-auto font-mono text-sm">
        {forfeitWinner ? (
          <div className="flex items-center justify-center h-full text-white font-bold gap-2">
            The opponent has fled the arena. {forfeitWinner === "P1" ? player1Fighter.name : player2Fighter.name} wins by default!
          </div>
        ) : rounds.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/40 gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Waiting for on-chain events...
          </div>
        ) : (
          <div className="space-y-2 flex flex-col-reverse">
            {rounds.map((r, i) => (
              <div key={i} className="flex flex-col space-y-1 p-2 bg-black/50 rounded border border-white/5">
                <div className="text-white/40 font-bold mb-1">Round {r.round}</div>
                <div className="text-white/70">&gt; <span className="text-white">{player1Fighter.name}</span> deals <span className="font-bold text-white">{r.p1Damage}</span> damage.</div>
                {r.p2Health > 0 && <div className="text-white/70">&gt; <span className="text-white">{player2Fighter.name}</span> deals <span className="font-bold text-white">{r.p2Damage}</span> damage.</div>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

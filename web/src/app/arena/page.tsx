"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { BATTLE_ARENA_ADDRESS, BattleArenaABI } from "@/lib/contracts";
import { BattleScreen } from "@/components/battle-screen";
import { Sword, Code2, Loader2, Send } from "lucide-react";
import { ARENA_QUESTIONS } from "@/lib/questions";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Button } from "@/components/ui/button";

export default function ArenaPage() {
  const { address, isConnected } = useAccount();

  // "IDLE" -> "QUEUE" -> "CODING" -> "WAITING_OPPONENT" -> "COUNTDOWN" -> "BATTLE"
  const [phase, setPhase] = useState<"IDLE" | "QUEUE" | "CODING" | "WAITING_OPPONENT" | "COUNTDOWN" | "BATTLE">("IDLE");
  
  const [activeBattleId, setActiveBattleId] = useState<bigint | null>(null);
  const [code, setCode] = useState("");
  const [myStats, setMyStats] = useState({ hp: 0, attack: 0, defense: 0, special: 0});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [completedBattleIds, setCompletedBattleIds] = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState(3);
  
  const publicClient = usePublicClient();

  // The provided API Key for Code Evaluation
  const OPENROUTER_API_KEY = "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";

  const activeQuestionIndex = activeBattleId ? Number(activeBattleId) % ARENA_QUESTIONS.length : 0;
  const activeQuestion = ARENA_QUESTIONS[activeQuestionIndex];

  // Global reads to know what battle we are joining
  const { data: pendingBattleId } = useReadContract({
    address: BATTLE_ARENA_ADDRESS,
    abi: BattleArenaABI,
    functionName: "pendingBattleId",
    query: { refetchInterval: phase === "IDLE" ? 10000 : false }
  }) as { data: bigint | undefined };

  const { data: battleCounter } = useReadContract({
    address: BATTLE_ARENA_ADDRESS,
    abi: BattleArenaABI,
    functionName: "battleCounter",
  }) as { data: bigint | undefined };

  // Multicall to fetch last 5 battles to auto-resume
  const battleQueries = [];
  if (battleCounter && battleCounter > BigInt(0)) {
    for (let i = 0; i < 5; i++) {
        const bId = Number(battleCounter) - i;
        if (bId > 0) {
            battleQueries.push({
                address: BATTLE_ARENA_ADDRESS,
                abi: BattleArenaABI,
                functionName: "battles",
                args: [BigInt(bId)]
            });
        }
    }
  }

  const { data: recentBattles } = useReadContracts({
    contracts: battleQueries as any,
    query: { refetchInterval: phase === "IDLE" ? 5000 : false }
  });

  // Auto-Resume State Recovery
  useEffect(() => {
    if (phase === "IDLE" && recentBattles && address) {
       for (let i = 0; i < recentBattles.length; i++) {
           if (recentBattles[i].status === "success") {
               const b = recentBattles[i].result as any;
               const bId = Number(battleCounter) - i;
               
               if (!b[12] || completedBattleIds.has(bId)) continue; // b[12] is isActive

               if (b[0] === address || b[1] === address) {
                   setActiveBattleId(BigInt(bId));
                   
                   const isP1 = b[0] === address;
                   const p1Submitted = b[6];
                   const p2Submitted = b[11];
                   const hasOpponent = b[1] !== "0x0000000000000000000000000000000000000000";

                   if (!hasOpponent) {
                       setPhase("QUEUE");
                   } else {
                       const iSubmitted = isP1 ? p1Submitted : p2Submitted;
                       if (!iSubmitted) {
                           setPhase("CODING");
                       } else {
                           setPhase("WAITING_OPPONENT");
                       }
                   }
                   break;
               }
           }
       }
    }
  }, [phase, recentBattles, address, battleCounter]);

  // Read our specific battle state
  const { data: battleData, refetch: refetchBattle } = useReadContract({
    address: BATTLE_ARENA_ADDRESS,
    abi: BattleArenaABI,
    functionName: "battles",
    args: [activeBattleId || BigInt(0)],
    query: { refetchInterval: (phase === "QUEUE" || phase === "WAITING_OPPONENT") ? 8000 : false }
  }) as any;

  const { writeContractAsync } = useWriteContract();

  // Handle Matchmaking
  const joinMatchmaking = async () => {
    // If they are auto-recovered immediately prior, prevent double-click
    if (activeBattleId) return;

    try {
      setPhase("QUEUE");

      // Predict what our battle ID will be
      const nextBattleId = pendingBattleId && pendingBattleId > BigInt(0) 
        ? pendingBattleId 
        : (battleCounter ? battleCounter + BigInt(1) : BigInt(1));
      
      setActiveBattleId(nextBattleId);

      await writeContractAsync({
        address: BATTLE_ARENA_ADDRESS,
        abi: BattleArenaABI,
        functionName: "joinMatchmaking",
        value: parseEther("0.01"),
      });

    } catch (e) {
      console.error(e);
      setPhase("IDLE");
      setActiveBattleId(null);
    }
  };

  const handleCancelMatchmaking = async () => {
    setIsExiting(true);
    try {
      const hash = await writeContractAsync({
        address: BATTLE_ARENA_ADDRESS,
        abi: BattleArenaABI,
        functionName: "cancelMatchmaking",
      });
      if (publicClient) {
         await publicClient.waitForTransactionReceipt({ hash });
      }
      setCompletedBattleIds(prev => new Set(prev).add(Number(activeBattleId || 0)));
      setPhase("IDLE");
      setActiveBattleId(null);
    } catch (e) {
      console.error("Failed to cancel matchmaking:", e);
    }
    setIsExiting(false);
  };

  const handleForfeit = async () => {
    if (!activeBattleId) return;
    setIsExiting(true);
    try {
      const hash = await writeContractAsync({
        address: BATTLE_ARENA_ADDRESS,
        abi: BattleArenaABI,
        functionName: "forfeit",
        args: [activeBattleId]
      });
      if (publicClient) {
         await publicClient.waitForTransactionReceipt({ hash });
      }
      setCompletedBattleIds(prev => new Set(prev).add(Number(activeBattleId)));
      setPhase("IDLE");
      setActiveBattleId(null);
    } catch (e) {
      console.error("Failed to forfeit:", e);
    }
    setIsExiting(false);
  };

  // Poll for Match start
  useEffect(() => {
    if (phase === "QUEUE" && battleData) {
      const p1 = battleData[0]; // player1
      const p2 = battleData[1]; // player2
      
      // If player2 is set, the match has officially begun!
      if (p2 !== "0x0000000000000000000000000000000000000000" && (p1 === address || p2 === address)) {
        setPhase("CODING");
        setCode(activeQuestion.stub);
      }
    }
  }, [phase, battleData, address]);

  // Evaluate Code via AI & Submit Stats
  const submitCode = async () => {
    if (!activeBattleId || !code.trim()) return;

    setIsEvaluating(true);

    let hp = 100; // Fixed HP
    let attack = 50;
    let defense = 50;
    let special = 50;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // Fast, deterministic model for judging
          messages: [
            {
              role: "system",
              content: "You are an expert programming judge for a battle arena. Grade the user's code for the given question strictly on a scale of 10 to 50 for three stats: 'attack' (efficiency and core logic), 'defense' (error handling and edge cases), and 'special' (cleverness and readability). Only output a raw JSON object string like: {\"attack\":45,\"defense\":20,\"special\":35}. DO NOT wrap it in markdown block quotes. Provide no other text."
            },
            {
              role: "user",
              content: `Question: ${activeQuestion.title}\nDescription: ${activeQuestion.description}\nCode:\n${code}`
            }
          ]
        })
      });

      const data = await response.json();
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error("OpenRouter returned empty response: " + JSON.stringify(data));
      }
      const statsStr = data.choices[0].message.content.trim();
      
      // Clean up markdown wrapping if present
      const cleanJson = statsStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedStats = JSON.parse(cleanJson);
      
      attack = Math.max(10, Math.min(50, Number(parsedStats.attack) || 25));
      defense = Math.max(10, Math.min(50, Number(parsedStats.defense) || 25));
      special = Math.max(10, Math.min(50, Number(parsedStats.special) || 25));
      
    } catch (e) {
      console.error("OpenRouter Evaluation Failed, using fallback stats", e);
      attack = 25; defense = 25; special = 25;
    }

    setIsEvaluating(false);

    setMyStats({ hp, attack, defense, special });
    setPhase("WAITING_OPPONENT");

    try {
      await writeContractAsync({
        address: BATTLE_ARENA_ADDRESS,
        abi: BattleArenaABI,
        functionName: "submitCodeStats",
        args: [activeBattleId, BigInt(hp), BigInt(attack), BigInt(defense), BigInt(special)],
      });
    } catch (e) {
      console.error(e);
      setPhase("CODING"); // Revert on failure
    }
  };

  // Poll for Battle Completion -> transition to COUNTDOWN
  useEffect(() => {
    if (phase === "WAITING_OPPONENT" && battleData) {
      const isComplete = battleData[13]; // isComplete boolean
      if (isComplete) {
        setCountdown(3);
        setPhase("COUNTDOWN");
      }
    }
  }, [phase, battleData]);

  // Countdown timer: 3 -> 2 -> 1 -> BATTLE
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;
    if (countdown <= 0) {
      setPhase("BATTLE");
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);


  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white/40">Please connect your wallet to enter the arena.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* PHASE: IDLE (Join Matchmaking) */}
      {phase === "IDLE" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-[family-name:var(--font-heading)] tracking-widest text-white">LIVE CODING ARENA</h1>
            <p className="text-white/40 uppercase tracking-widest font-bold">Stake 0.01 MON. Write Code. Destroy Opponents.</p>
          </div>
          
          <div className="flex items-center gap-4 text-white/40">
            {pendingBattleId && pendingBattleId > BigInt(0) ? (
              <span className="animate-pulse font-bold text-white text-lg">An Opponent is waiting in the lobby. Join Now!</span>
            ) : (
              <span>Lobby is empty. Join to start looking for a match.</span>
            )}
          </div>

          <ButtonWithIcon onClick={joinMatchmaking} className="text-lg h-14 ps-8 pe-16">
            <span className="flex items-center gap-3"><Sword className="w-5 h-5" /> Find Match (0.01 MON)</span>
          </ButtonWithIcon>
        </div>
      )}

      {/* PHASE: QUEUE (Waiting for player 2) */}
      {phase === "QUEUE" && (
         <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center relative">
           <Button 
             onClick={handleCancelMatchmaking}
             disabled={isExiting}
             variant="outline"
             className="absolute top-0 right-0 rounded-full"
           >
             {isExiting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
             {isExiting ? "Canceling..." : "Cancel Search"}
           </Button>
           <Loader2 className="w-16 h-16 text-white animate-spin" />
           <div>
             <h2 className="text-3xl font-[family-name:var(--font-heading)] text-white tracking-widest uppercase">Searching for Opponent</h2>
             <p className="text-white/40 mt-2">Waiting for another warrior to stake MON and enter the arena...</p>
           </div>
        </div>
      )}

      {/* PHASE: CODING (Writing the algorithm) */}
      {phase === "CODING" && (
        <div className="space-y-6 relative">
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-white/70" />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-[family-name:var(--font-heading)] text-white tracking-widest uppercase">{activeQuestion.title}</h2>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${activeQuestion.difficulty === 'Easy' ? 'bg-white/10 text-white/60' : 'bg-white/10 text-white/80'}`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-white/5 text-white/40 uppercase">
                    {activeQuestion.language}
                  </span>
                </div>
                <p className="text-white/40 text-sm font-bold mt-1 max-w-2xl">{activeQuestion.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleForfeit}
                disabled={isExiting}
                variant="outline"
                className="rounded-full"
              >
                {isExiting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isExiting ? "Forfeiting..." : "Forfeit"}
              </Button>
              <ButtonWithIcon
                onClick={submitCode}
                disabled={isEvaluating || !code.trim()}
              >
                {isEvaluating ? "AI Evaluating Code..." : "Submit Algorithm"}
              </ButtonWithIcon>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <CodeMirror
              value={code}
              height="600px"
              theme={oneDark}
              extensions={[javascript({ jsx: true })]}
              onChange={(value) => setCode(value)}
              className="text-lg"
            />
          </div>
        </div>
      )}

      {/* PHASE: WAITING_OPPONENT (Code submitted, waiting for opponent to finish) */}
      {phase === "WAITING_OPPONENT" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center relative">
            <Button 
               onClick={handleForfeit}
               disabled={isExiting}
               variant="outline"
               className="absolute top-0 right-0 rounded-full"
             >
               {isExiting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
               {isExiting ? "Forfeiting..." : "Forfeit"}
             </Button>
            <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-xl mb-8">
               <div className="flex flex-col items-center"><span className="text-white/40 text-xs font-bold uppercase">Generated HP</span><span className="text-2xl font-black text-white">{myStats.hp}</span></div>
               <div className="flex flex-col items-center"><span className="text-white/40 text-xs font-bold uppercase">Generated ATK</span><span className="text-2xl font-black text-white">{myStats.attack}</span></div>
               <div className="flex flex-col items-center"><span className="text-white/40 text-xs font-bold uppercase">Generated DEF</span><span className="text-2xl font-black text-white">{myStats.defense}</span></div>
               <div className="flex flex-col items-center"><span className="text-white/40 text-xs font-bold uppercase">Generated SPC</span><span className="text-2xl font-black text-white">{myStats.special}</span></div>
            </div>
           <Loader2 className="w-16 h-16 text-white animate-spin" />
           <div>
             <h2 className="text-3xl font-[family-name:var(--font-heading)] text-white tracking-widest uppercase">Awaiting Opponent's Code</h2>
             <p className="text-white/40 mt-2">Your stats have been locked in on the Monad Testnet. Waiting for opponent...</p>
           </div>
        </div>
      )}

      {/* PHASE: COUNTDOWN (3-2-1 synchronized timer) */}
      {phase === "COUNTDOWN" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <h2 className="text-xl font-bold text-white/40 uppercase tracking-[0.5em]">
            Both fighters ready
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 3, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.2, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              {countdown > 0 ? (
                <span className="text-[12rem] font-[family-name:var(--font-heading)] text-white leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                  {countdown}
                </span>
              ) : (
                <span className="text-7xl font-[family-name:var(--font-heading)] text-white tracking-widest drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]">
                  FIGHT!
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-white/30 text-sm uppercase tracking-widest">
            Battle starts in...
          </p>
        </div>
      )}

      {/* PHASE: BATTLE (Resolving combat visually) */}
      {phase === "BATTLE" && battleData && (
        <div className="space-y-12 mb-20 animate-in fade-in duration-1000">
          <h2 className="text-center text-3xl font-[family-name:var(--font-heading)] tracking-widest text-white">
            RESULT MATRIX
          </h2>
          <BattleScreen 
            battleId={activeBattleId!} 
            player1Fighter={{
              address: battleData[0],
              name: "Hacker One",
              maxHealth: Number(battleData[2]),
              attack: Number(battleData[3]),
              defense: Number(battleData[4]),
              specialAbility: Number(battleData[5]),
              codeScore: 100
            }}
            player2Fighter={{
              address: battleData[1],
              name: "Hacker Two",
              maxHealth: Number(battleData[7]),
              attack: Number(battleData[8]),
              defense: Number(battleData[9]),
              specialAbility: Number(battleData[10]),
              codeScore: 100
            }}
            onComplete={(winner) => {
              // Once animation completes, they can return to lobby
              setTimeout(() => {
                setCompletedBattleIds(prev => new Set(prev).add(Number(activeBattleId)));
                setPhase("IDLE");
                setActiveBattleId(null);
              }, 5000);
            }}
          />
        </div>
      )}
    </div>
  );
}

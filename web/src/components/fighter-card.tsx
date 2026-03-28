"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Heart, Sword } from "lucide-react";
import Image from "next/image";

interface FighterStats {
  name: string;
  health: number;
  attack: number;
  defense: number;
  specialAbility: number;
  codeScore: number;
}

interface Props {
  stats: FighterStats;
  isAttacking?: boolean;
  isDefending?: boolean;
  isSpecial?: boolean;
  currentHealth?: number;
}

export function FighterCard({ stats, isAttacking, isDefending, isSpecial, currentHealth }: Props) {
  const healthToDisplay = currentHealth !== undefined ? currentHealth : stats.health;
  const healthPercentage = Math.max(0, Math.min(100, (healthToDisplay / stats.health) * 100));

  const healthBarColor = healthPercentage > 50
    ? "bg-white"
    : healthPercentage > 20
    ? "bg-white/60"
    : "bg-white/30";

  // Deterministically select one of the 4 models based on stats
  const modelIndex = ((stats.attack + stats.defense + stats.health) % 4) + 1;
  const imagePath = `/models/1 (${modelIndex}).png`;

  return (
    <motion.div
      animate={{
        y: isAttacking ? -30 : isDefending ? 10 : 0,
        x: isAttacking ? 20 : isDefending ? -10 : 0,
        scale: isSpecial ? 1.1 : 1,
        rotate: isAttacking ? 5 : isDefending ? -5 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="relative w-72 h-[420px] rounded-2xl border border-white/20 overflow-hidden group"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={imagePath} 
          alt={stats.name} 
          fill 
          className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
          sizes="300px"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* Special attack flash */}
      {isSpecial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: 1 }}
          className="absolute inset-0 bg-white/30 z-10"
        />
      )}

      {/* Hit flash */}
      {isDefending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white/20 z-10"
        />
      )}

      {/* Card Content - overlaid on top of the image */}
      <div className="relative z-20 h-full flex flex-col justify-end p-5 gap-3">
        {/* Fighter Name */}
        <h2 className="font-[family-name:var(--font-heading)] text-xl text-white tracking-widest uppercase text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {stats.name}
        </h2>

        {/* HP Bar */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest">
            <span>HP</span>
            <span>{healthToDisplay} / {stats.health}</span>
          </div>
          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/20 p-0.5">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: healthPercentage + "%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={"h-full rounded-full " + healthBarColor}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <Sword className="w-3.5 h-3.5 text-white/70 mb-0.5" />
            <span className="font-bold text-white text-sm">{stats.attack}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-wider">ATK</span>
          </div>
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <Shield className="w-3.5 h-3.5 text-white/70 mb-0.5" />
            <span className="font-bold text-white text-sm">{stats.defense}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-wider">DEF</span>
          </div>
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <Zap className="w-3.5 h-3.5 text-white/70 mb-0.5" />
            <span className="font-bold text-white text-sm">{stats.specialAbility}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-wider">SPC</span>
          </div>
          <div className="flex flex-col items-center bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/10">
            <Heart className="w-3.5 h-3.5 text-white/70 mb-0.5" />
            <span className="font-bold text-white text-sm">{stats.codeScore}</span>
            <span className="text-[8px] text-white/40 uppercase tracking-wider">SCR</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

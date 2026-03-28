"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-12">
      
      {/* Hero Text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-4xl"
      >
        <h1 className="text-7xl md:text-9xl font-[family-name:var(--font-heading)] tracking-tighter text-white">
          ETERNAL
        </h1>
        <p className="text-xl md:text-2xl text-white/50 font-light tracking-wide max-w-2xl mx-auto">
          The ultimate on-chain auto-battler. Write the strongest algorithm live in your browser. Fight for eternal glory on Monad Testnet.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-6 items-center"
      >
        <Link href="/arena">
          <ButtonWithIcon>Enter Arena</ButtonWithIcon>
        </Link>
        
        <Link href="/leaderboard">
          <ButtonWithIcon variant="outline">Leaderboard</ButtonWithIcon>
        </Link>
      </motion.div>

    </div>
  );
}

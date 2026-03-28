import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying Live Coding Battle Contracts...");

  const Leaderboard = await ethers.getContractFactory("Leaderboard");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();
  const leaderboardAddr = await leaderboard.getAddress();
  console.log("Leaderboard deployed to:", leaderboardAddr);

  const BattleArena = await ethers.getContractFactory("BattleArena");
  const arena = await BattleArena.deploy(leaderboardAddr);
  await arena.waitForDeployment();
  const arenaAddr = await arena.getAddress();
  console.log("BattleArena deployed to:", arenaAddr);

  const tx = await leaderboard.setArenaContract(arenaAddr);
  await tx.wait();
  console.log("Arena linked to Leaderboard.");

  // Read ABIs
  const artifactsDir = path.join(process.cwd(), "artifacts/contracts");
  const leaderboardAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "Leaderboard.sol/Leaderboard.json"), "utf-8")).abi;
  const arenaAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "BattleArena.sol/BattleArena.json"), "utf-8")).abi;

  const outputFilePath = path.join(process.cwd(), "../web/src/lib/contracts.ts");
  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

  const content = `import { Address } from "viem";

export const LEADERBOARD_ADDRESS = "${leaderboardAddr}" as Address;
export const BATTLE_ARENA_ADDRESS = "${arenaAddr}" as Address;

// Old addresses kept for backward compatibility if needed, though unused
export const FIGHTER_JUDGE_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const CHALLENGE_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const LeaderboardABI = ${JSON.stringify(leaderboardAbi)} as const;
export const BattleArenaABI = ${JSON.stringify(arenaAbi)} as const;
`;

  fs.writeFileSync(outputFilePath, content);
  console.log(`Frontend contract addresses and ABIs written to ${outputFilePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

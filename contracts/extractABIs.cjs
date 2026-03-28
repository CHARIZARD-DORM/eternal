const fs = require("fs");
const path = require("path");

const artifactsDir = path.join(__dirname, "artifacts/contracts");

const judgeAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "FighterJudge.sol/FighterJudge.json"), "utf-8")).abi;
const leaderboardAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "Leaderboard.sol/Leaderboard.json"), "utf-8")).abi;
const arenaAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "BattleArena.sol/BattleArena.json"), "utf-8")).abi;
const registryAbi = JSON.parse(fs.readFileSync(path.join(artifactsDir, "ChallengeRegistry.sol/ChallengeRegistry.json"), "utf-8")).abi;

const outputFilePath = path.join(__dirname, "../web/src/lib/contracts.ts");
fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

const content = `import { Address } from "viem";

// Replace these with actual Monad Testnet deployed addresses
export const FIGHTER_JUDGE_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const LEADERBOARD_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const BATTLE_ARENA_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const CHALLENGE_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
export const SAMPLE_FIGHTER_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const FighterJudgeABI = ${JSON.stringify(judgeAbi)} as const;
export const LeaderboardABI = ${JSON.stringify(leaderboardAbi)} as const;
export const BattleArenaABI = ${JSON.stringify(arenaAbi)} as const;
export const ChallengeRegistryABI = ${JSON.stringify(registryAbi)} as const;
`;

fs.writeFileSync(outputFilePath, content);
console.log("Frontend contract addresses and ABIs written to " + outputFilePath);

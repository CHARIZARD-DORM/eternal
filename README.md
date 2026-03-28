# ETERNAL ⚔️

> The ultimate on-chain live-coding battle arena on Monad Testnet.

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-black?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-white?style=flat-square&logo=nextdotjs&logoColor=black)
![Monad](https://img.shields.io/badge/Network-Monad%20Testnet-white?style=flat-square)

## What is Eternal?

Eternal is a **real-time, on-chain auto-battler** where two players stake MON tokens, solve a live coding challenge in their browser, and have their code graded by AI. The resulting stats power an animated fighter that battles the opponent's fighter — all resolved on-chain.

### How It Works

1. **Stake** — Both players stake 0.01 MON to enter matchmaking.
2. **Code** — A random coding question is assigned. You write your solution in-browser.
3. **AI Grades** — Your code is evaluated by GPT-4o-mini via OpenRouter. Better code = better fighter stats (Attack, Defense, Special). HP is fixed at 100.
4. **Fight** — Stats are submitted on-chain. The smart contract simulates combat rounds deterministically. The winner receives the combined stake.
5. **Climb** — Wins earn leaderboard points and unlock ability slots.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Framer Motion, CodeMirror |
| **Styling** | Tailwind CSS 4, shadcn/ui components |
| **Fonts** | Bungee Shade (headings), Montserrat (body) |
| **Blockchain** | Solidity 0.8.28, Hardhat, Monad Testnet |
| **Web3** | wagmi, viem, ConnectKit |
| **AI Grading** | OpenRouter API (gpt-4o-mini) |

## Project Structure

```
eternal/
├── contracts/           # Solidity smart contracts & Hardhat config
│   ├── contracts/
│   │   ├── BattleArena.sol    # Core matchmaking & combat engine
│   │   └── Leaderboard.sol    # Points, ranks & ability slots
│   ├── deploy.ts              # Deployment script
│   └── hardhat.config.ts
├── web/                 # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   ├── arena/page.tsx     # Battle arena (matchmaking → coding → combat)
│       │   ├── leaderboard/       # Global rankings
│       │   └── profile/           # Player stats
│       ├── components/
│       │   ├── battle-screen.tsx   # Combat visualizer with animations
│       │   ├── fighter-card.tsx    # Fighter card with full-bleed background
│       │   ├── providers.tsx       # Wagmi/ConnectKit/auto-disconnect
│       │   └── ui/                # shadcn button components
│       └── lib/
│           ├── contracts.ts       # ABIs & deployed addresses
│           ├── questions.ts       # 20 curated coding challenges
│           └── utils.ts           # Tailwind merge utility
└── models/              # Fighter avatar images
```

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask wallet with Monad Testnet configured
- Monad Testnet MON tokens ([Faucet](https://faucet.monad.xyz))

### Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run deploy.ts --network monadTestnet
```

After deploying, update the addresses in `web/src/lib/contracts.ts`.

### Frontend

```bash
cd web
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your MetaMask wallet.

## Network Configuration

| Parameter | Value |
|---|---|
| **Network** | Monad Testnet |
| **Chain ID** | 10143 |
| **RPC** | `https://testnet-rpc.monad.xyz` |
| **Stake Amount** | 0.01 MON per match |

## Key Features

- **Deterministic Matchmaking** — Shared question bank with `BattleID % 20` assignment
- **AI Code Grading** — GPT-4o-mini evaluates Attack (10-50), Defense (10-50), Special (10-50)
- **Fixed HP (100)** — Every fighter gets 100 HP for balanced gameplay
- **Auto-Resume** — Interrupted sessions are automatically restored on page load
- **Forfeit System** — Players can exit at any stage with proper on-chain handling
- **Session Timeout** — Wallets auto-disconnect after 30 min inactivity or browser restart

## License

MIT

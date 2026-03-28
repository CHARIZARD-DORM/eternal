import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "monad-testnet": {
      url: "https://testnet-rpc.monad.xyz",
      accounts: ["0x70af327753a523f1afecbff7b0cd93c63f935b6142df7f53bf24c51c309df718"],
      chainId: 10143
    }
  }
};

export default config;

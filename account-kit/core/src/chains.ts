import { SOLANA_CHAIN_SYMBOL, SOLANA_DEVNET_CHAIN_SYMBOL } from "./symbols.js";
import type { Web3Connection } from "./types.js";

export const SOLANA_CHAIN: Web3Connection["chain"] = {
  id: SOLANA_CHAIN_SYMBOL,
  name: "Solana",
  nativeCurrency: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
  },
};

export const SOLANA_DEV_CHAIN: Web3Connection["chain"] = {
  id: SOLANA_DEVNET_CHAIN_SYMBOL,
  name: "Solana Devnet",
  nativeCurrency: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
  },
};

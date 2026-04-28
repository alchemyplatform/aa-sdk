import { BaseError } from "@alchemy/common";
import { createClient, defineChain, type Address } from "viem";
import { solanaSmartWalletActions } from "./decorators/solanaSmartWalletActions.js";
import type {
  SolanaSmartWalletClient,
  SolanaSigner,
  SolanaChainDef,
} from "./types.js";
import { createInternalState } from "./internal.js";
import type { AlchemyWalletTransport } from "./transport.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";

const solanaMainnet: SolanaChainDef = {
  ...defineChain({
    id: 101,
    name: "Solana Mainnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana:mainnet",
};

const solanaDevnet: SolanaChainDef = {
  ...defineChain({
    id: 103,
    name: "Solana Devnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana:devnet",
};

const SOLANA_CHAINS: Record<SolanaChainId, SolanaChainDef> = {
  "solana:mainnet": solanaMainnet,
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": solanaMainnet,
  "solana:devnet": solanaDevnet,
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": solanaDevnet,
};

export type CreateSolanaSmartWalletClientParams = {
  signer: SolanaSigner;
  transport: AlchemyWalletTransport;
  chain: SolanaChainId;
  account?: string;
  paymaster?: {
    policyId: string;
  };
};

export const createSolanaSmartWalletClient = ({
  signer,
  transport,
  chain,
  account,
  paymaster,
}: CreateSolanaSmartWalletClientParams): SolanaSmartWalletClient => {
  const _policyIds = paymaster?.policyId ? [paymaster.policyId] : [];

  const _account = account ?? signer.address;

  const _chain = SOLANA_CHAINS[chain];
  if (!chain) {
    throw new BaseError(`Unsupported Solana chain: ${chain}`);
  }

  return createClient({
    account: _account as Address, // This cast is a lie to get Viem to accept it, but it's fine since the Solana client only uses our custom actions.
    transport,
    chain: _chain,
    name: "alchemySolanaSmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(solanaSmartWalletActions);
};

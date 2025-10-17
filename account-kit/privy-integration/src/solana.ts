// Solana-specific exports
// Import from '@account-kit/privy-integration/solana' to use Solana functionality
// This ensures @solana/web3.js is only loaded when explicitly needed

export { useAlchemySolanaTransaction } from "./hooks/useAlchemySolanaTransaction.js";

export type {
  PromiseOrValue,
  PreSend,
  TransformInstruction,
  SolanaTransactionParamOptions,
  SolanaTransactionParams,
  SolanaTransactionResult,
  UseAlchemySolanaTransactionOptions,
  UseAlchemySolanaTransactionResult,
} from "./hooks/useAlchemySolanaTransaction.js";

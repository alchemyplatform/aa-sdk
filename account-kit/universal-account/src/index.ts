// Provider & Hooks (recommended - seamless integration)
export {
  UniversalAccountProvider,
  useUniversalAccount,
  useUnifiedBalance,
  useSendTransaction,
  useUniversalAccountContext,
  type UniversalAccountProviderConfig,
  type UniversalAccountProviderProps,
  type UniversalAccountContextValue,
} from "./provider.js";

// Client (for advanced/manual usage)
export {
  UniversalAccountClient,
  createUniversalAccountClient,
  type CreateUniversalAccountClientParams,
} from "./client.js";

// Constants
export {
  CHAIN_ID,
  TOKEN_TYPE,
  NATIVE_TOKEN_ADDRESS,
  type ChainId,
  type TokenType,
} from "./constants.js";

// Types
export type {
  UniversalAccountConfig,
  TradeConfig,
  SmartAccountOptions,
  AssetInfo,
  ChainAssetInfo,
  PrimaryAssets,
  TokenIdentifier,
  ExpectToken,
  TransferTransactionParams,
  UniversalTransactionParams,
  BuyTransactionParams,
  SellTransactionParams,
  ConvertTransactionParams,
  TransactionRequest,
  UniversalTransaction,
  FeeQuote,
  TransactionResult,
  IUniversalAccount,
} from "./types.js";

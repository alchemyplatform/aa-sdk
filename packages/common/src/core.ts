// The viem-free entry point ("@alchemy/common/core"): everything here is
// importable without viem installed. The root barrel ("@alchemy/common")
// additionally exposes the viem-based transport, chains, and BaseError for
// wallet-facing packages. Dependency-free consumers (the Data APIs core)
// import from this entry only — adding a viem-dependent export here breaks
// their install, and the data-apis CI proof will catch it.

// errors (AlchemyError-rooted family — no viem)
export { AlchemyError } from "./errors/AlchemyError.js";
export type { AlchemyApiErrorDetails } from "./errors/AlchemyApiError.js";
export { AlchemyApiError } from "./errors/AlchemyApiError.js";
export { FetchError } from "./errors/FetchError.js";
export { ServerError } from "./errors/ServerError.js";

// REST + JSON-RPC runtime
export type * from "./rest/restClient.js";
export type * from "./rest/types.js";
export { AlchemyRestClient } from "./rest/restClient.js";
export type {
  AlchemyJsonRpcClientParams,
  JsonRpcRequestFn,
  JsonRpcSchema,
} from "./rest/jsonRpcClient.js";
export { AlchemyJsonRpcClient } from "./rest/jsonRpcClient.js";

// network identity (slug / CAIP-2 resolution; viem Chain accepted type-only)
export type {
  AlchemyNetwork,
  KnownAlchemyNetwork,
  NetworkInput,
  ResolvedNetwork,
} from "./networks/networkRegistry.js";
export { resolveNetwork } from "./networks/networkRegistry.js";

// chain registry data (generated; no viem)
export {
  getAlchemyRpcUrl,
  getSupportedChainIds,
  isChainSupported,
} from "./transport/chainRegistry.js";

// utils
export { composeSignals, sleep } from "./utils/signals.js";
export { redactUrlCredentials } from "./utils/redact.js";

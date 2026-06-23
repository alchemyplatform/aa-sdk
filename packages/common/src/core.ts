// The viem-free entry point ("@alchemy/common/core"): everything here is
// importable without viem installed. The root barrel ("@alchemy/common")
// additionally exposes the viem-based transport, chains, and BaseError for
// wallet-facing packages. Chain-library-free consumers (the Data APIs core)
// import from this entry only; adding a viem-dependent export here breaks
// their install, and the data-apis no-viem proof will catch it.

// errors (AlchemyError-rooted family — no viem)
export { AlchemyError } from "./errors/AlchemyError.js";
export type { AlchemyApiErrorDetails } from "./errors/AlchemyApiError.js";
export { AlchemyApiError } from "./errors/AlchemyApiError.js";
export { AlchemyFetchError } from "./errors/AlchemyFetchError.js";
export { AlchemyServerError } from "./errors/AlchemyServerError.js";

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

// network identity (slug / CAIP-2 resolution; chain ID bridge for adapters)
export type {
  AlchemyNetwork,
  KnownAlchemyNetwork,
  ResolvedNetwork,
} from "./networks/networkRegistry.js";
export {
  resolveNetwork,
  resolveNetworkByChainId,
} from "./networks/networkRegistry.js";

// chain registry data (generated; no viem)
export {
  getAlchemyRpcUrl,
  getSupportedChainIds,
  isChainSupported,
} from "./transport/chainRegistry.js";

// utils
export { composeSignals, sleep } from "./utils/signals.js";
export { redactUrlCredentials } from "./utils/redact.js";

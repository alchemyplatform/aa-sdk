// transport
export type * from "./transport/alchemy.js";
export { alchemyTransport, isAlchemyTransport } from "./transport/alchemy.js";

// http — shared REST + JSON-RPC runtime (viem-free); used by @alchemy/data-apis
export type * from "./rest/restClient.js";
export type * from "./rest/types.js";
export { AlchemyRestClient } from "./rest/restClient.js";
export type {
  AlchemyJsonRpcClientParams,
  JsonRpcRequestFn,
  JsonRpcSchema,
} from "./rest/jsonRpcClient.js";
export { AlchemyJsonRpcClient } from "./rest/jsonRpcClient.js";

// chain registry utilities
export {
  getAlchemyRpcUrl,
  isChainSupported,
  getSupportedChainIds,
} from "./transport/chainRegistry.js";

// network registry (slug / CAIP-2 / viem Chain resolution)
export type {
  KnownAlchemyNetwork,
  AlchemyNetwork,
  NetworkInput,
  ResolvedNetwork,
} from "./networks/networkRegistry.js";
export { resolveNetwork } from "./networks/networkRegistry.js";

// utils
export type * from "./utils/types.js";
export { composeSignals, sleep } from "./utils/signals.js";
export { redactUrlCredentials } from "./utils/redact.js";
export { assertNever } from "./utils/assertNever.js";
export { raise } from "./utils/raise.js";
export { bigIntMultiply, bigIntMax } from "./utils/bigint.js";
export { lowerAddress } from "./utils/lowerAddress.js";

// config
export type { AlchemyConnectionConfig } from "./transport/connectionSchema.js";
export {
  AlchemyConnectionConfigSchema,
  validateAlchemyConnectionConfig,
  isAlchemyConnectionConfig,
} from "./transport/connectionSchema.js";

// errors
export { BaseError } from "./errors/BaseError.js";
export { AlchemyError } from "./errors/AlchemyError.js";
export type { AlchemyApiErrorDetails } from "./errors/AlchemyApiError.js";
export { AlchemyApiError } from "./errors/AlchemyApiError.js";
export { ChainNotFoundError } from "./errors/ChainNotFoundError.js";
export { AccountNotFoundError } from "./errors/AccountNotFoundError.js";
export { ConnectionConfigError } from "./errors/ConnectionConfigError.js";
export { FetchError } from "./errors/FetchError.js";
export { ServerError } from "./errors/ServerError.js";
export { InvalidRequestError } from "./errors/InvalidRequestError.js";
export { MethodUnsupportedError } from "./errors/MethodUnsupportedError.js";

export type * from "./transport/alchemy.js";
export { alchemy, isAlchemyTransport } from "./transport/alchemy.js";
export type * from "./transport/split.js";
export { split } from "./transport/split.js";
export type * from "./utils/types.js";

// config
export type { AlchemyConnectionConfig } from "./transport/connectionSchema.js";
export {
  AlchemyConnectionConfigSchema,
  validateAlchemyConnectionConfig,
  isAlchemyConnectionConfig,
  createApiKeyConfig,
  createJwtConfig,
  createProxyConfig,
  createRpcUrlConfig,
  createProxyUrlConfig,
} from "./transport/connectionSchema.js";

// errors
export { BaseError } from "./errors/BaseError.js";
export { ChainNotFoundError } from "./errors/ChainNotFoundError.js";
export { AccountNotFoundError } from "./errors/AccountNotFoundError.js";
export { ConnectionConfigError } from "./errors/ConnectionConfigError.js";

// actions
export type * from "./actions/addBreadCrumb.js";
export { addBreadCrumb } from "./actions/addBreadCrumb.js";

import { alchemy as alchemyCommon } from "@alchemy/common";
import { type PublicRpcSchema } from "viem";
import type { AlchemyHttpSchema, AlchemyJsonRpcSchema } from "./schema.js";

export type * from "@alchemy/common";
export { ChainNotFoundError } from "@alchemy/common";

// Alchemy transport gets overridden here because we need to define the Http and JSON-RPC schemas which might be aggregated from various packages
export const alchemy = alchemyCommon<
  [...PublicRpcSchema, ...AlchemyJsonRpcSchema],
  AlchemyHttpSchema
>;

import { ChainSchema } from "@aa-sdk/core";
import type { Chain } from "viem";
import z from "zod";

export const AlchemyChainSchema = z.custom<Chain>((chain) => {
  const chain_ = ChainSchema.parse(chain);

  return chain_.rpcUrls.alchemy != null;
}, "chain must include an alchemy rpc url. See `defineAlchemyChain` or import a chain from `@account-kit/infra`.");

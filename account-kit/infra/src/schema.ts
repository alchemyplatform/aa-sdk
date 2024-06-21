import {
  ChainSchema,
  ConnectionConfigSchema,
  SmartAccountClientOptsSchema,
} from "@aa-sdk/core";
import { Alchemy } from "alchemy-sdk";
import type { Chain } from "viem";
import z from "zod";

export const AlchemyChainSchema = z.custom<Chain>((chain) => {
  const chain_ = ChainSchema.parse(chain);

  return chain_.rpcUrls.alchemy != null;
}, "chain must include an alchemy rpc url. See `createAlchemyChain` or use the `AlchemyChainMap` exported from `@aa-sdk/core`");

export const AlchemyProviderConfigSchema = ConnectionConfigSchema.and(
  z.object({
    chain: AlchemyChainSchema,
    opts: SmartAccountClientOptsSchema.optional().default(
      SmartAccountClientOptsSchema.parse({})
    ),
  })
);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

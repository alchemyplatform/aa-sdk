import {
  ChainSchema,
  ConnectionConfigSchema,
  SmartAccountClientOptsSchema,
  getChain,
} from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import type { Chain } from "viem";
import z from "zod";

export const AlchemyChainSchema = z.custom<Chain>((chain) => {
  const _chain = ChainSchema.parse(chain);

  let chainObject;
  try {
    chainObject = getChain(_chain.id);
  } catch {
    return false;
  }

  return chainObject.rpcUrls.alchemy != null;
}, "chain must include an alchemy rpc url. See `createAlchemyChain` or use the `AlchemyChainMap` exported from `@alchemy/aa-core`");

export const AlchemyProviderConfigSchema = ConnectionConfigSchema.and(
  z.object({
    chain: AlchemyChainSchema,
    opts: SmartAccountClientOptsSchema.optional().default(
      SmartAccountClientOptsSchema.parse({})
    ),
  })
);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

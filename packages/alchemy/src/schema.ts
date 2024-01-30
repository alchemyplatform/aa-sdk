import {
  ChainSchema,
  ConnectionConfigSchema,
  SmartAccountProviderOptsSchema,
  getChain,
} from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import type { Chain } from "viem";
import z from "zod";
import { SupportedChains } from "./chains.js";

export const AlchemyChainSchema = z.custom<Chain>((chain) => {
  const _chain = ChainSchema.parse(chain);

  let chainObject;
  try {
    chainObject = getChain(_chain.id);
  } catch {
    return false;
  }

  return (
    SupportedChains.get(_chain.id) != null &&
    chainObject.rpcUrls.alchemy != null
  );
}, "chain is not supported by Alchemy");

export const AlchemyProviderConfigSchema = ConnectionConfigSchema.and(
  z.object({
    chain: AlchemyChainSchema,
    opts: SmartAccountProviderOptsSchema.optional().default(
      SmartAccountProviderOptsSchema.parse({})
    ),
  })
);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

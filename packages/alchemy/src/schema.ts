import { LightAccountFactoryConfigSchema } from "@alchemy/aa-accounts";
import {
  ChainSchema,
  ConnectionConfigSchema,
  createSmartAccountProviderConfigSchema,
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

export const AlchemyProviderConfigSchema =
  createSmartAccountProviderConfigSchema()
    .omit({ rpcProvider: true, chain: true })
    .and(ConnectionConfigSchema)
    .and(z.object({ chain: AlchemyChainSchema }));

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

export const LightAccountAlchemyProviderConfigSchema =
  AlchemyProviderConfigSchema.and(LightAccountFactoryConfigSchema);

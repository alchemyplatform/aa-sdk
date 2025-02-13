import { ChainSchema } from "@aa-sdk/core";
import { Alchemy } from "alchemy-sdk";
import type { Chain } from "viem";
import z from "zod";

export const AlchemyChainSchema = z.custom<Chain>((chain) => {
  const chain_ = ChainSchema.parse(chain);

  return chain_.rpcUrls.alchemy != null;
}, "chain must include an alchemy rpc url. See `createAlchemyChain` or import a chain from `@account-kit/infra`.");

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

import { LightAccountFactoryConfigSchema } from "@alchemy/aa-accounts";
import { createSmartAccountProviderConfigSchema } from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import z from "zod";

export const ConnectionConfigSchema = z.union([
  z.object({
    rpcUrl: z.never().optional(),
    apiKey: z.string(),
    jwt: z.never().optional(),
  }),
  z.object({
    rpcUrl: z.never().optional(),
    apiKey: z.never().optional(),
    jwt: z.string(),
  }),
  z.object({
    rpcUrl: z.string(),
    apiKey: z.never().optional(),
    jwt: z.never().optional(),
  }),
  z.object({
    rpcUrl: z.string(),
    apiKey: z.never().optional(),
    jwt: z.string(),
  }),
]);

export const AlchemyProviderConfigSchema =
  createSmartAccountProviderConfigSchema()
    .omit({ rpcProvider: true })
    .and(ConnectionConfigSchema);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

export const LightAccountAlchemyProviderConfigSchema =
  AlchemyProviderConfigSchema.and(LightAccountFactoryConfigSchema);

import { LightAccountFactoryConfigSchema } from "@alchemy/aa-accounts";
import {
  ConnectionConfigSchema,
  createSmartAccountProviderConfigSchema,
} from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import z from "zod";

export const AlchemyProviderConfigSchema =
  createSmartAccountProviderConfigSchema()
    .omit({ rpcProvider: true })
    .and(ConnectionConfigSchema);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

export const LightAccountAlchemyProviderConfigSchema =
  AlchemyProviderConfigSchema.and(LightAccountFactoryConfigSchema);

import { AlchemyProviderConfigSchema } from "@alchemy/aa-alchemy";
import {
  SignerSchema,
  createSmartAccountProviderConfigSchema,
} from "@alchemy/aa-core";
import { Address } from "AbiType/zod";
import { isHex } from "viem";
import { z } from "zod";

export const LightAccountFactoryConfigSchema = z.object({
  owner: SignerSchema,
  accountAddress: Address.optional().describe(
    "Optional override for the account address."
  ),
  initCode: z
    .string()
    .refine(isHex, "initCode must be a valid hex.")
    .optional()
    .describe("Optional override for the account init code."),
});

export const LightAccountAlchemyProviderConfigSchema =
  AlchemyProviderConfigSchema.and(LightAccountFactoryConfigSchema);

export const LightAccountProviderConfigSchema =
  createSmartAccountProviderConfigSchema().and(LightAccountFactoryConfigSchema);

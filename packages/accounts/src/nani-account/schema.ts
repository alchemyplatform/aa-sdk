import {
  SignerSchema,
  createSmartAccountProviderConfigSchema,
} from "@alchemy/aa-core";
import { Address } from "abitype/zod";
import { isHex } from "viem";
import { z } from "zod";

export const NaniAccountFactoryConfigSchema = z.object({
  owner: SignerSchema,
  accountAddress: Address.optional().describe(
    "Optional override for the account address."
  ),
  initCode: z
    .string()
    .refine(isHex, "initCode must be a valid hex.")
    .optional()
    .describe("Optional override for the account init code."),
  factoryAddress: Address.optional().describe(
    "Optional override for the factory address which deploys the smart account."
  ),
});

export const NaniAccountProviderConfigSchema =
  createSmartAccountProviderConfigSchema().and(NaniAccountFactoryConfigSchema);

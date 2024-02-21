import { SignerSchema } from "@alchemy/aa-core";
import { Address } from "abitype/zod";
import { isHex } from "viem";
import { z } from "zod";

export const NaniAccountFactoryConfigSchema = z.object({
  signer: SignerSchema,
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
  salt: z
    .string()
    .refine(isHex, "salt must be a valid hex")
    .refine((s) => s.length === 66, "salt must be 32 bytes")
    .optional()
    .describe("Optional override for the account salt."),
  index: z
    .bigint()
    .optional()
    .describe("Optional override for the account index."),
});

import {
  SignerSchema,
  createSmartAccountProviderConfigSchema,
} from "@alchemy/aa-core";
import { Address } from "abitype/zod";
import { isHex } from "viem";
import { z } from "zod";
import { LightAccountVersions, type LightAccountVersion } from "./utils.js";

const isLightAccountVersion = (x: unknown): x is LightAccountVersion => {
  if (typeof x === "string" && x in LightAccountVersions) {
    return true;
  }

  return false;
};

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
  factoryAddress: Address.optional().describe(
    "Optional override for the factory address which deploys the smart account."
  ),
  version: z
    .string()
    .refine<LightAccountVersion>(
      isLightAccountVersion,
      "Version must be a valid Light Account version."
    )
    .optional(),
});

export const LightAccountProviderConfigSchema =
  createSmartAccountProviderConfigSchema().and(LightAccountFactoryConfigSchema);

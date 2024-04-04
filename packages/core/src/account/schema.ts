import { Address } from "abitype/zod";
import { isHex, type Transport } from "viem";
import z from "zod";
import { createPublicErc4337ClientSchema } from "../client/schema.js";
import { isEntryPointVersion } from "../entrypoint/index.js";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { isSigner } from "../signer/schema.js";
import type { SmartAccountSigner } from "../signer/types.js";
import { ChainSchema } from "../utils/index.js";

export const createBaseSmartAccountParamsSchema = <
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>() =>
  z.object({
    rpcClient: z.union([
      z.string(),
      createPublicErc4337ClientSchema<TTransport>(),
    ]),
    factoryAddress: Address,
    signer: z.custom<TSigner>(isSigner),
    entryPointAddress: Address.optional(),
    chain: ChainSchema,
    accountAddress: Address.optional().describe(
      "Optional override for the account address."
    ),
    initCode: z
      .string()
      .refine(
        (x) => isHex(x, { strict: true }),
        "initCode must be a valid hex."
      )
      .optional()
      .describe("Optional override for the account init code."),
    entryPointVersion: z
      .custom<EntryPointVersion>(isEntryPointVersion)
      .optional(),
  });

export const SimpleSmartAccountParamsSchema = <
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>() =>
  createBaseSmartAccountParamsSchema<TTransport, TSigner>()
    .omit({
      rpcClient: true,
    })
    .extend({
      transport: z.custom<TTransport>(),
      salt: z.bigint().optional(),
    });

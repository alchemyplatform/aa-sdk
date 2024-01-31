import { Address } from "abitype/zod";
import { isHex, type Transport } from "viem";
import z from "zod";
import { createPublicErc4337ClientSchema } from "../client/schema.js";
import { isSigner } from "../signer/schema.js";
import type { SmartAccountSigner } from "../signer/types.js";
import { ChainSchema } from "../utils/index.js";

export const createBaseSmartAccountParamsSchema = <
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner | undefined = SmartAccountSigner | undefined
>() =>
  z.object({
    rpcClient: z.union([
      z.string(),
      createPublicErc4337ClientSchema<TTransport>(),
    ]),
    factoryAddress: Address,
    owner: z
      .custom<TOwner>((owner) => (owner ? isSigner(owner) : undefined))
      .optional(),
    entryPointAddress: Address.optional(),
    chain: ChainSchema,
    accountAddress: Address.optional().describe(
      "Optional override for the account address."
    ),
    initCode: z
      .string()
      .refine(isHex, "initCode must be a valid hex.")
      .optional()
      .describe("Optional override for the account init code."),
  });

export const SimpleSmartAccountParamsSchema = <
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>() =>
  createBaseSmartAccountParamsSchema<TTransport, TOwner>()
    .omit({
      rpcClient: true,
    })
    .extend({
      transport: z.custom<TTransport>(),
      owner: z.custom<TOwner>(isSigner),
      index: z.bigint().optional(),
    });

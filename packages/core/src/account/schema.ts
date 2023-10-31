import { Address } from "abitype/zod";
import type { Transport } from "viem";
import z from "zod";
import { createPublicErc4337ClientSchema } from "../client/schema.js";
import type { SupportedTransports } from "../client/types";
import { SignerSchema } from "../signer/schema.js";
import { ChainSchema } from "../utils/index.js";

export const createBaseSmartAccountParamsSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  z.object({
    rpcClient: z.union([
      z.string(),
      createPublicErc4337ClientSchema<TTransport>(),
    ]),
    factoryAddress: Address,
    owner: SignerSchema.optional(),
    entryPointAddress: Address.optional(),
    chain: ChainSchema,
    accountAddress: Address.optional(),
  });

export const SimpleSmartAccountParamsSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    index: z.bigint().optional(),
  });

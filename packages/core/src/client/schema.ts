import type { Transport } from "viem";
import { z } from "zod";

import { BigNumberishRangeSchema, PercentageSchema } from "../utils/index.js";
import type { BundlerClient } from "./bundlerClient.js";

export const createPublicErc4337ClientSchema = <
  TTransport extends Transport = Transport
>() =>
  z.custom<BundlerClient<TTransport>>((provider) => {
    return (
      provider != null &&
      typeof provider === "object" &&
      "request" in provider &&
      "type" in provider &&
      "key" in provider &&
      "name" in provider
    );
  });

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

export const UserOperationFeeOptionsFieldSchema =
  BigNumberishRangeSchema.merge(PercentageSchema).partial();

export const UserOperationFeeOptionsSchema = z
  .object({
    maxFeePerGas: UserOperationFeeOptionsFieldSchema,
    maxPriorityFeePerGas: UserOperationFeeOptionsFieldSchema,
    callGasLimit: UserOperationFeeOptionsFieldSchema,
    verificationGasLimit: UserOperationFeeOptionsFieldSchema,
    preVerificationGas: UserOperationFeeOptionsFieldSchema,
  })
  .partial()
  .strict();

export const SmartAccountClientOptsSchema = z
  .object({
    /**
     * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
     */
    txMaxRetries: z.number().min(0).optional().default(5),

    /**
     * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000)
     */
    txRetryIntervalMs: z.number().min(0).optional().default(2_000),

    /**
     * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
     */
    txRetryMultiplier: z.number().min(0).optional().default(1.5),

    /**
     * Optional user operation fee options to be set globally at the provider level
     */
    feeOptions: UserOperationFeeOptionsSchema.optional(),
  })
  .strict();

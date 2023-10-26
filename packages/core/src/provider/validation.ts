import { Address as zAddress } from "abitype/zod";
import z from "zod";
import { getChain } from "../utils/index.js";

export const SmartAccountProviderOptsSchema = z.object({
  /**
   * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
   */
  txMaxRetries: z.number().optional(),

  /**
   * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000n)
   */
  txRetryIntervalMs: z.number().optional(),

  /**
   * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
   */
  txRetryMulitplier: z.number().optional(),

  /**
   * used when computing the fees for a user operation (default: 100_000_000n)
   */
  minPriorityFeePerBid: z.bigint().optional(),
});

export const SmartAccountProviderConfigSchema = z.object({
  rpcProvider: z.union([
    z.string(),
    z.any().refine((provider) => {
      return (
        typeof provider === "object" &&
        "request" in provider &&
        "type" in provider &&
        "key" in provider &&
        "name" in provider
      );
    }),
  ]),
  chain: z.any().refine((chain) => {
    if (!("id" in chain) || typeof chain.id !== "number") {
      return false;
    }

    try {
      return getChain(chain.id) !== undefined;
    } catch {
      return false;
    }
  }),
  entryPointAddress: zAddress,
  opts: SmartAccountProviderOptsSchema.optional(),
});

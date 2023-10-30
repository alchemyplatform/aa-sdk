import { Address as zAddress } from "abitype/zod";
import type { Chain, Transport } from "viem";
import z from "zod";
import type { PublicErc4337Client, SupportedTransports } from "../client/types";
import { getChain } from "../utils/index.js";

export const SmartAccountProviderOptsSchema = z.object({
  /**
   * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
   */
  txMaxRetries: z.number().optional().default(5),

  /**
   * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000)
   */
  txRetryIntervalMs: z.number().optional().default(2_000),

  /**
   * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
   */
  txRetryMulitplier: z.number().optional().default(1.5),

  /**
   * used when computing the fees for a user operation (default: 100_000_000n)
   */
  minPriorityFeePerBid: z.bigint().optional().default(100_000_000n),
});

export const SmartAccountProviderConfigSchema = <
  TTransport extends SupportedTransports = Transport
>() => {
  return z.object({
    rpcProvider: z.union([
      z.string(),
      z
        .any()
        .refine<PublicErc4337Client<TTransport>>(
          (provider): provider is PublicErc4337Client<TTransport> => {
            return (
              typeof provider === "object" &&
              "request" in provider &&
              "type" in provider &&
              "key" in provider &&
              "name" in provider
            );
          }
        ),
    ]),

    chain: z.any().refine<Chain>((chain): chain is Chain => {
      if (
        !(typeof chain === "object") ||
        !("id" in chain) ||
        typeof chain.id !== "number"
      ) {
        return false;
      }

      try {
        return getChain(chain.id) !== undefined;
      } catch {
        return false;
      }
    }),

    /**
     * Optional entry point contract address for override if needed.
     * If not provided, the default entry point contract for the chain will be used.
     * Refer to https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints
     * when using Alchemy as your RPC provider.
     */
    entryPointAddress: zAddress.optional(),

    opts: SmartAccountProviderOptsSchema.optional(),
  });
};

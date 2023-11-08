import { createSmartAccountProviderConfigSchema } from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import z from "zod";

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

export const FeeOptsSchema = z.object({
  /** this adds a percent buffer on top of the base fee estimated (default 50%)
   * NOTE: this is only applied if the default fee estimator is used.
   */
  baseFeeBufferPercent: z.bigint().optional(),
  /** this adds a percent buffer on top of the priority fee estimated (default 5%)'
   * * NOTE: this is only applied if the default fee estimator is used.
   */
  maxPriorityFeeBufferPercent: z.bigint().optional(),
  /** this adds a percent buffer on top of the preVerificationGas estimated
   *
   * Defaults 5% on Arbitrum and Optimism, 0% elsewhere
   *
   * This is only useful on Arbitrum and Optimism, where the preVerificationGas is
   * dependent on the gas fee during the time of estimation. To improve chances of
   * the UserOperation being mined, users can increase the preVerificationGas by
   * a buffer. This buffer will always be charged, regardless of price at time of mine.
   *
   * NOTE: this is only applied if the defualt gas estimator is used.
   */
  preVerificationGasBufferPercent: z.bigint().optional(),
});

export const AlchemyProviderConfigSchema = z
  .object({
    feeOpts: FeeOptsSchema.optional(),
  })
  .and(createSmartAccountProviderConfigSchema().omit({ rpcProvider: true }))
  .and(ConnectionConfigSchema);

export const AlchemySdkClientSchema = z.instanceof(Alchemy);

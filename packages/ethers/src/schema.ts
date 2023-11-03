import {
  SmartAccountProvider,
  createPublicErc4337ClientSchema,
} from "@alchemy/aa-core";
import { Address as zAddress } from "abitype/zod";
import type { HttpTransport } from "viem";
import z from "zod";

export const EthersProviderAdapterOptsSchema = z
  .object({
    entryPointAddress: zAddress.optional(),
  })
  .and(
    z
      .object({
        rpcProvider: z.union([
          z.string(),
          createPublicErc4337ClientSchema<HttpTransport>(),
        ]),
        chainId: z.number(),
      })
      .or(
        z.object({
          accountProvider: z.instanceof(SmartAccountProvider<HttpTransport>),
        })
      )
  );

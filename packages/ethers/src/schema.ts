import {
  SmartAccountProvider,
  type PublicErc4337Client,
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
          z
            .any()
            .refine<PublicErc4337Client<HttpTransport>>(
              (provider): provider is PublicErc4337Client<HttpTransport> => {
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
        chainId: z.number(),
      })
      .or(
        z.object({
          accountProvider: z.instanceof(SmartAccountProvider<HttpTransport>),
        })
      )
  );

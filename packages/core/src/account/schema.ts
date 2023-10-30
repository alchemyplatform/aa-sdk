import { Address as zAddress } from "abitype/zod";
import type { Chain, Transport } from "viem";
import z from "zod";
import type { PublicErc4337Client, SupportedTransports } from "../client/types";
import type { SmartAccountSigner } from "../signer/types";
import { getChain } from "../utils/index.js";

export const BaseSmartAccountParamsSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  z.object({
    rpcClient: z.union([
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
    factoryAddress: zAddress,
    owner: z
      .any()
      .refine<SmartAccountSigner>((signer): signer is SmartAccountSigner => {
        return (
          typeof signer === "object" &&
          "signerType" in signer &&
          "signMessage" in signer &&
          "signTypedData" in signer &&
          "getAddress" in signer
        );
      })
      .optional(),
    entryPointAddress: zAddress.optional(),
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
    accountAddress: zAddress.optional(),
  });

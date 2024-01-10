import {
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type SupportedTransports,
} from "@alchemy/aa-core";
import { Address as zAddress } from "abitype/zod";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type FallbackTransport,
  type Transport,
} from "viem";
import { z } from "zod";
import { StandardExecutor } from "../index.js";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import { MultiOwnerTokenReceiverMSCAFactoryAbi } from "./abis/MultiOwnerTokenReceiverMSCAFactory.js";
import { accountLoupeDecorators } from "./account-loupe/decorator.js";
import { MSCABuilder } from "./builder/index.js";
import { WrapWith712SignerMethods } from "./builder/wrapped-signer.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner/plugin.js";
import { TokenReceiverPlugin } from "./plugins/token-receiver/plugin.js";

export const createMultiOwnerMSCASchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    owners: z.array(zAddress).default([]),
    index: z.bigint().optional().default(0n),
    excludeDefaultTokenReceiverPlugin: z.boolean().optional().default(false),
  });

export type MultiOwnerMSCAParams = z.input<
  ReturnType<typeof createMultiOwnerMSCASchema>
>;

export const createMultiOwnerMSCABuilder = <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);

  const builder = new MSCABuilder()
    .withFactory(async (acct) => {
      const ownerAddress = await params.owner.getAddress();
      // owners need to be dedupe + ordered in ascending order and not == to zero address
      const owners = Array.from(new Set([...params.owners, ownerAddress]))
        .filter((x) => hexToBigInt(x) !== 0n)
        .sort((a, b) => {
          const bigintA = hexToBigInt(a);
          const bigintB = hexToBigInt(b);

          return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
        });
      return concatHex([
        acct.getFactoryAddress(),
        encodeFunctionData({
          abi: params.excludeDefaultTokenReceiverPlugin
            ? MultiOwnerMSCAFactoryAbi
            : MultiOwnerTokenReceiverMSCAFactoryAbi,
          functionName: "createAccount",
          args: [params.index, owners],
        }),
      ]);
    })
    .withExecutor(StandardExecutor)
    .withSigner(WrapWith712SignerMethods);

  return builder;
};

export const createMultiOwnerMSCA = <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);
  const builder = createMultiOwnerMSCABuilder<TTransport>(params);

  let account = builder
    .build(params)
    .extendWithPluginMethods(MultiOwnerPlugin)
    .extend(accountLoupeDecorators);

  if (params.excludeDefaultTokenReceiverPlugin) {
    return account;
  }

  return account.extendWithPluginMethods(TokenReceiverPlugin);
};

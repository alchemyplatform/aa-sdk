import { type SupportedTransports } from "@alchemy/aa-core";
import { Address as zAddress } from "abitype/zod";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type FallbackTransport,
  type Transport,
} from "viem";
import { z } from "zod";
import {
  SessionKeyExecutor,
  SessionKeyPlugin,
  SessionKeySigner,
  StandardExecutor,
  getDefaultMultiOwnerMSCAFactoryAddress,
} from "../index.js";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import { MultiOwnerTokenReceiverMSCAFactoryAbi } from "./abis/MultiOwnerTokenReceiverMSCAFactory.js";
import { accountLoupeDecorators } from "./account-loupe/decorator.js";
import {
  MSCABuilder,
  ModularAccountBuilderParamsSchema,
} from "./builder/index.js";
import { WrapWith712SignerMethods } from "./builder/wrapped-signer.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner/index.js";
import type { SessionKeySignerConfig } from "./plugins/session-key/signer.js";
import { TokenReceiverPlugin } from "./plugins/token-receiver/plugin.js";

export const createMultiOwnerMSCASchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  ModularAccountBuilderParamsSchema<TTransport>()
    .extend({
      owners: z.array(zAddress).default([]),
      index: z.bigint().optional().default(0n),
      excludeDefaultTokenReceiverPlugin: z.boolean().optional().default(false),
      factoryAddress: zAddress.optional(),
    })
    .transform((params) => {
      const factoryAddress =
        params.factoryAddress ??
        getDefaultMultiOwnerMSCAFactoryAddress(
          params.chain,
          params.excludeDefaultTokenReceiverPlugin
        );

      return {
        ...params,
        factoryAddress,
      };
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

/**
 * This method will create a new MSCA account leveraging a session key signer with fallback to your provided signer
 * You can use this with a deployed or undeployed account. If the account is not deployed yet, it will deploy it for you
 * on your first UO and sign the UO with your fallback signer. After that, you can install the session key plugin and add
 * the session key to that account.
 *
 * @param params_ -- configuration params for creating a new MSCA account
 * @param sessionKeyOverrides -- overrides for the session key signer config
 * @returns a new MSCA account leveraging a session key signer with fallback to your provided signer
 */
export const createMultiOwnerMSCAWithSessionKey = async <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams,
  sessionKeyOverrides?: Pick<
    SessionKeySignerConfig<MultiOwnerMSCAParams["owner"]>,
    "storageKey" | "storageType"
  > & { keyActive?: boolean }
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);
  const builder = createMultiOwnerMSCABuilder<TTransport>(params);
  const sessionKeySigner = new SessionKeySigner({
    fallbackSigner: params.owner,
    ...sessionKeyOverrides,
  });
  sessionKeySigner.setKeyActive(sessionKeyOverrides?.keyActive ?? true);

  // get the base account so we can get the init code and address of the account
  // NOTE: if the user passed in an initCode or accountAddress, we will use those instead
  // because the builder's params handles that logic
  const baseAccount = builder.build(params);
  const accountAddress = await baseAccount.getAddress();
  const initCode = await baseAccount.getInitCode();

  let account = builder
    .withExecutor(SessionKeyExecutor)
    .build({ ...params, owner: sessionKeySigner, initCode, accountAddress })
    .extendWithPluginMethods(MultiOwnerPlugin)
    .extendWithPluginMethods(SessionKeyPlugin)
    .extend(accountLoupeDecorators);

  if (params.excludeDefaultTokenReceiverPlugin) {
    return account;
  }

  return account.extendWithPluginMethods(TokenReceiverPlugin);
};

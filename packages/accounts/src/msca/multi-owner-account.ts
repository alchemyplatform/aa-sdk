import {
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type SignTypedDataParams,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hashMessage,
  hashTypedData,
  hexToBytes,
  isBytes,
  toBytes,
  type FallbackTransport,
  type Hash,
  type Transport,
} from "viem";
import { z } from "zod";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import { MSCABuilder, StandardExecutor } from "./builder.js";
import { MultiOwnerPlugin } from "./plugins/multi-owner.js";

export const createMultiOwnerMSCASchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    index: z.bigint().optional().default(0n),
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
      return concatHex([
        acct.getFactoryAddress(),
        encodeFunctionData({
          abi: MultiOwnerMSCAFactoryAbi,
          functionName: "createAccount",
          // TODO: this needs to support creating accounts with multiple owners
          args: [params.index, [ownerAddress]],
        }),
      ]);
    })
    .withExecutor(StandardExecutor)
    .withSigner((acct) => {
      const signWith1271Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
        const multiOwnerAugmented =
          acct.extendWithPluginMethods(MultiOwnerPlugin);

        const [, name, version, chainId, verifyingContract, salt] =
          await multiOwnerAugmented.readEip712Domain();

        return params.owner.signTypedData({
          domain: {
            chainId: Number(chainId),
            name,
            salt,
            verifyingContract,
            version,
          },
          types: {
            ERC6900Message: [{ name: "message", type: "bytes" }],
          },
          message: {
            ERC6900Message: {
              message: toBytes(msg),
            },
          },
          primaryType: "ERC6900Message",
        });
      };

      return {
        getDummySignature(): `0x${string}` {
          return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
        },

        signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
          return params.owner.signMessage(hexToBytes(uoHash));
        },

        signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
          return signWith1271Wrapper(
            hashMessage(
              typeof msg === "string" && !isBytes(msg)
                ? msg
                : {
                    raw: msg,
                  }
            )
          );
        },

        signTypedData(params: SignTypedDataParams): Promise<`0x${string}`> {
          return signWith1271Wrapper(hashTypedData(params));
        },
      };
    });

  return builder;
};

export const createMultiOwnerMSCA = <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);
  const builder = createMultiOwnerMSCABuilder<TTransport>(params);

  const account = builder
    .build(params)
    .extendWithPluginMethods(MultiOwnerPlugin);

  return account;
};

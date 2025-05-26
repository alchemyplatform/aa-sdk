import type { Address, BundlerClient, SmartAccountSigner } from "@aa-sdk/core";
import {
  hashMessage,
  hashTypedData,
  type Hash,
  type Hex,
  type SignableMessage,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { MultiOwnerPlugin, MultiOwnerPluginAbi } from "./plugin.js";

export const multiOwnerMessageSigner = <
  TTransport extends Transport,
  TSigner extends SmartAccountSigner,
>(
  client: BundlerClient<TTransport>,
  accountAddress: Address,
  signer: () => TSigner,
  pluginAddress: Address = MultiOwnerPlugin.meta.addresses[client.chain.id],
) => {
  const signWith712Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    const [, name, version, chainId, verifyingContract, salt] =
      await client.readContract({
        abi: MultiOwnerPluginAbi,
        address: pluginAddress,
        functionName: "eip712Domain",
        account: accountAddress,
      });

    return signer().signTypedData({
      domain: {
        chainId: Number(chainId),
        name,
        salt,
        verifyingContract,
        version,
      },
      types: {
        AlchemyModularAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "AlchemyModularAccountMessage",
    });
  };

  return {
    getDummySignature: (): Hex => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    signUserOperationHash: (uoHash: `0x${string}`): Promise<`0x${string}`> => {
      return signer().signMessage({ raw: uoHash });
    },

    signMessage({
      message,
    }: {
      message: SignableMessage;
    }): Promise<`0x${string}`> {
      return signWith712Wrapper(hashMessage(message));
    },

    signTypedData: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
    ): Promise<Hex> => {
      return signWith712Wrapper(hashTypedData(typedDataDefinition));
    },
  };
};

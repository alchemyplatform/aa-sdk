import type {
  Address,
  PublicErc4337Client,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  hexToBytes,
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
  TSigner extends SmartAccountSigner
>(
  client: PublicErc4337Client<TTransport>,
  accountAddress: Address,
  owner: () => TSigner,
  pluginAddress: Address = MultiOwnerPlugin.meta.addresses[client.chain.id]
) => {
  const signWith712Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    // TODO: right now this is hard coded to one Plugin address, but we should make this configurable somehow
    const [, name, version, chainId, verifyingContract, salt] =
      await client.readContract({
        abi: MultiOwnerPluginAbi,
        address: pluginAddress,
        functionName: "eip712Domain",
        account: accountAddress,
      });

    return owner().signTypedData({
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
    getDummySignature: (): `0x${string}` => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    signUserOperationHash: (uoHash: `0x${string}`): Promise<`0x${string}`> => {
      return owner().signMessage(hexToBytes(uoHash));
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
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      return signWith712Wrapper(hashTypedData(typedDataDefinition));
    },
  };
};

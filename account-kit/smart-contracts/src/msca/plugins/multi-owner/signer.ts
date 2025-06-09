import type {
  Address,
  BundlerClient,
  SmartAccountSigner,
  SignatureRequest,
} from "@aa-sdk/core";
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
  const get712Wrapper = async (msg: Hash): Promise<TypedDataDefinition> => {
    const [, name, version, chainId, verifyingContract, salt] =
      await client.readContract({
        abi: MultiOwnerPluginAbi,
        address: pluginAddress,
        functionName: "eip712Domain",
        account: accountAddress,
      });

    return {
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
    };
  };

  const prepareSign = async (
    params: SignatureRequest,
  ): Promise<SignatureRequest> => {
    const data = await get712Wrapper(
      params.type === "personal_sign"
        ? hashMessage(params.data)
        : hashTypedData(params.data),
    );
    return {
      type: "eth_signTypedData_v4",
      data,
    };
  };

  const formatSign = async (
    signature: `0x${string}`,
  ): Promise<`0x${string}`> => {
    return signature;
  };

  return {
    prepareSign,
    formatSign,
    getDummySignature: (): Hex => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    signUserOperationHash: (uoHash: `0x${string}`): Promise<`0x${string}`> => {
      return signer().signMessage({ raw: uoHash });
    },

    async signMessage({
      message,
    }: {
      message: SignableMessage;
    }): Promise<`0x${string}`> {
      const { type, data } = await prepareSign({
        type: "personal_sign",
        data: message,
      });
      return type === "personal_sign"
        ? signer().signMessage(data)
        : signer().signTypedData(data);
    },

    signTypedData: async <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
    ): Promise<Hex> => {
      const { type, data } = await prepareSign({
        type: "eth_signTypedData_v4",
        data: typedDataDefinition as TypedDataDefinition,
      });
      return type === "personal_sign"
        ? signer().signMessage(data)
        : signer().signTypedData(data);
    },
  };
};

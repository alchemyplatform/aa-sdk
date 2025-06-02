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
import { MultisigPlugin, MultisigPluginAbi } from "./plugin.js";

type MultisigSignMethodsParams<
  TTransport extends Transport,
  TSigner extends SmartAccountSigner,
> = {
  client: BundlerClient<TTransport>;
  accountAddress: Address;
  signer: () => TSigner;
  threshold: bigint;
  pluginAddress?: Address;
};

export const multisigSignMethods = <
  TTransport extends Transport,
  TSigner extends SmartAccountSigner,
>({
  client,
  accountAddress,
  signer,
  threshold,
  pluginAddress = MultisigPlugin.meta.addresses[client.chain.id],
}: MultisigSignMethodsParams<TTransport, TSigner>) => {
  const get712Wrapper = async (msg: Hash): Promise<TypedDataDefinition> => {
    const [, name, version, chainId, verifyingContract, salt] =
      await client.readContract({
        abi: MultisigPluginAbi,
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
        AlchemyMultisigMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "AlchemyMultisigMessage",
    };
  };

  const prepareSign = async (
    params: SignatureRequest,
  ): Promise<SignatureRequest> => {
    const messageHash =
      params.type === "personal_sign"
        ? hashMessage(message)
        : hashTypedData(params.data);

    return {
      type: "eth_signTypedData_v4",
      data: await get712Wrapper(messageHash),
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
    getDummySignature: async (): Promise<`0x${string}`> => {
      const [, thresholdRead] = await client.readContract({
        abi: MultisigPluginAbi,
        address: pluginAddress,
        functionName: "ownershipInfoOf",
        args: [accountAddress],
      });

      const actualThreshold = thresholdRead === 0n ? threshold : thresholdRead;

      // (uint upperLimitPreVerificationGas, uint upperLimitMaxFeePerGas, uint upperLimitMaxPriorityFeePerGas)
      // the first sig will be on "actual" with v = 32
      return ("0x" +
        "FF".repeat(32 * 3) +
        "fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3c" +
        "fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c".repeat(
          Number(actualThreshold) - 1,
        )) as Hex;
    },

    signUserOperationHash: (uoHash: Hex): Promise<Hex> => {
      return signer().signMessage({ raw: uoHash });
    },

    async signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
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

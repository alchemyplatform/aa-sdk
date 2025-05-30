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
  const signWith712Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    const [, name, version, chainId, verifyingContract, salt] =
      await client.readContract({
        abi: MultisigPluginAbi,
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
        AlchemyMultisigMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "AlchemyMultisigMessage",
    });
  };

  return {
    prepareSign: () => {
      throw new Error("not implemented");
    },
    formatSign: () => {
      throw new Error("not implemented");
    },
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

    signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
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

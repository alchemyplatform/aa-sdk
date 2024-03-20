import type {
  Address,
  BundlerClient,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  type Hash,
  type Hex,
  type SignableMessage,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
  encodeAbiParameters,
  hexToBigInt,
} from "viem";
import { MultisigPlugin, MultisigPluginAbi } from "./plugin.js";
import type { Signature } from "./types.js";
import { UserOpSignatureType, SignerType } from "./types.js";

export const multisigMessageSigner = <
  TTransport extends Transport,
  TSigner extends SmartAccountSigner
>(
  client: BundlerClient<TTransport>,
  accountAddress: Address,
  signer: () => TSigner,
  pluginAddress: Address = MultisigPlugin.meta.addresses[client.chain.id]
) => {
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
        AlchemyModularAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "AlchemyModularAccountMessage",
    });
  };

  return {
    getDummySignature: async (): Promise<`0x${string}`> => {
      const [, threshold] = await client.readContract({
        abi: MultisigPluginAbi,
        address: pluginAddress,
        functionName: "ownershipInfoOf",
        args: [accountAddress],
      });

      // (uint upperLimitPreVerificationGas, uint upperLimitMaxFeePerGas, uint upperLimitMaxPriorityFeePerGas)
      // all sigs will be on "actual" with v = 32
      return (
        "0x" +
        "FF".repeat(64 * 3) +
        "FF".repeat(Number(threshold) * 39) +
        "20"
      ).repeat(Number(threshold)) as `0x${string}`;
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
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      return signWith712Wrapper(hashTypedData(typedDataDefinition));
    },
  };
};

export const formatSignatures = (signatures: Signature[]) => {
  let eoaSigs: string = "";
  let contractSigs: string = "";
  let offset: bigint = BigInt(65 * signatures.length);
  signatures
    .sort((a, b) => {
      const bigintA = hexToBigInt(a.signer);
      const bigintB = hexToBigInt(b.signer);

      return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
    })
    .forEach((sig) => {
      // add 32 to v if the signature covers the actual gas values
      const addV = sig.userOpSigType === UserOpSignatureType.Actual ? 32 : 0;

      if (sig.signerType === SignerType.EOA) {
        let v = parseInt(sig.signature.slice(130, 132)) + addV;
        eoaSigs += sig.signature.slice(2, 130) + v.toString(16);
      }
      else {
        const sigLen = BigInt(sig.signature.slice(2).length / 2);
        eoaSigs +=
          "0x" +
          encodeAbiParameters(
            [{ type: "uint256" }, { type: "bytes32" }, { type: "uint8" }],
            [offset, sig.signer, addV]
          ).slice(2);
        contractSigs +=
          encodeAbiParameters([{ type: "uint256" }], [sigLen]) +
          sig.signature.slice(2);
        offset += sigLen;
      }
    });
  return ("0x" + eoaSigs + contractSigs) as `0x${string}`;
};

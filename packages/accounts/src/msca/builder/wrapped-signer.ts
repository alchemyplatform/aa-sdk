import type { SignTypedDataParams } from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  hexToBytes,
  isBytes,
  type Hash,
} from "viem";
import {
  MultiOwnerPlugin,
  MultiOwnerPluginAbi,
} from "../plugins/multi-owner/plugin.js";
import type { SignerMethods } from "./types";

export const WrapWith712SignerMethods: SignerMethods = (acct) => {
  const owner = acct.getOwner();

  if (!owner) {
    throw new Error("owner is required for use with signer methods");
  }

  const signWith712Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    // TODO: right now this is hard coded to one Plugin address, but we should make this configurable somehow
    const [, name, version, chainId, , salt] =
      await acct.rpcProvider.readContract({
        abi: MultiOwnerPluginAbi,
        address: MultiOwnerPlugin.meta.addresses[acct.rpcProvider.chain.id],
        functionName: "eip712Domain",
        account: await acct.getAddress(),
      });

    return owner.signTypedData({
      domain: {
        chainId: Number(chainId),
        name,
        salt,
        verifyingContract: await acct.getAddress(),
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
    getDummySignature(): `0x${string}` {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
      return owner.signMessage(hexToBytes(uoHash));
    },

    signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
      return signWith712Wrapper(
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
      return signWith712Wrapper(hashTypedData(params));
    },
  };
};

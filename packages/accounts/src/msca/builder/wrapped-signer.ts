import type { SignTypedDataParams } from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  hexToBytes,
  isBytes,
  type Hash,
} from "viem";
import { MultiOwnerPlugin } from "../plugins/multi-owner/plugin.js";
import type { SignerMethods } from "./types";

export const WrapWith712SignerMethods: SignerMethods = (acct) => {
  const owner = acct.getOwner();

  if (!owner) {
    throw new Error("owner is required for use with signer methods");
  }

  const signWith712Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    const { readEip712Domain } = MultiOwnerPlugin.accountMethods(acct);

    const [, name, version, chainId, verifyingContract, salt] =
      await readEip712Domain();

    return owner.signTypedData({
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

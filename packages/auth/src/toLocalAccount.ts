import {
  type LocalAccount,
  type Hex,
  type TypedDataDefinition,
  parseSignature,
} from "viem";
import type { AuthSession } from "./authSession.js";
import type { SignAuthorizationReturnType } from "viem/actions";
import { hashAuthorization } from "viem/utils";

export const toLocalAccount = (authSession: AuthSession): LocalAccount => {
  const address = authSession.getAddress();
  return {
    address,
    source: "alchemy-auth",
    type: "local",
    publicKey: address,
    sign: async (params): Promise<Hex> => {
      return await authSession.signRawPayload({
        mode: "ETHEREUM",
        payload: params.hash,
      });
    },
    signMessage: async (params): Promise<Hex> => {
      return await authSession.signMessage({ message: params.message });
    },
    signTypedData: async (params): Promise<Hex> => {
      // TODO(jh): can we fix the type here w/o casting?
      return await authSession.signTypedData(params as TypedDataDefinition);
    },
    signAuthorization: async (params): Promise<SignAuthorizationReturnType> => {
      const { chainId, nonce } = params;
      const address = params.contractAddress ?? params.address;
      const hashedAuth = hashAuthorization({ address, chainId, nonce });
      const signatureHex = await authSession.signRawPayload({
        mode: "ETHEREUM",
        payload: hashedAuth,
      });
      const signature = parseSignature(signatureHex);
      return {
        address,
        chainId,
        nonce,
        ...signature,
      };
    },
    signTransaction: () => {
      throw new Error("Signing transactions is unsupported by Alchemy Auth");
    },
  };
};

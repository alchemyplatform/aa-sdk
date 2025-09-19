import {
  type LocalAccount,
  type Hex,
  parseSignature,
  type TypedDataDefinition,
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
    // Ideally this would be the full public key instead of the
    // address, but seems this isn't actually used by viem anywhere.
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
      // TODO(jh): test that this casting is safe.
      return await authSession.signTypedData(params as TypedDataDefinition);
    },
    // TODO(jh): test that this actually works.
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

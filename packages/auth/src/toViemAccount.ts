import { type LocalAccount, type Hex, type TypedDataDefinition } from "viem";
import type { AuthSession } from "./authSession.js";
import type { SignAuthorizationReturnType } from "viem/actions";

export const toViemAccount = (authSession: AuthSession): LocalAccount => {
  const address = authSession.getAddress();
  return {
    address,
    source: "custom",
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
      // This type casting seems safe. Typed Data types in Viem are tricky.
      return await authSession.signTypedData(params as TypedDataDefinition);
    },
    signAuthorization: async (params): Promise<SignAuthorizationReturnType> => {
      return await authSession.signAuthorization({
        ...params,
        address: params.contractAddress ?? params.address,
      });
    },
    signTransaction: () => {
      throw new Error("Signing transactions is unsupported by Alchemy Auth");
    },
  };
};

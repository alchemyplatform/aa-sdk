import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  hashMessage,
  hashTypedData,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";

export const singleSignerMessageSigner = <TSigner extends SmartAccountSigner>(
  signer: TSigner
) => {
  return {
    getDummySignature: (): Hex => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    signUserOperationHash: (uoHash: `0x${string}`): Promise<`0x${string}`> => {
      return signer.signMessage({ raw: uoHash });
    },

    signMessage({
      message,
    }: {
      message: SignableMessage;
    }): Promise<`0x${string}`> {
      return signer.signMessage({ raw: hashMessage(message) });
    },

    signTypedData: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      return signer.signMessage({ raw: hashTypedData(typedDataDefinition) });
    },
  };
};

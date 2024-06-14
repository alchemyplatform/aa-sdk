import {
  getAddress,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  type WalletClient,
} from "viem";
import { InvalidSignerTypeError } from "../errors/signer.js";
import type { SmartAccountSigner } from "./types";

export class WalletClientSigner implements SmartAccountSigner<WalletClient> {
  signerType: string;
  inner: WalletClient;

  constructor(client: WalletClient, signerType: string) {
    this.inner = client;
    if (!signerType) {
      throw new InvalidSignerTypeError(signerType);
    }
    this.signerType = signerType;
  }

  getAddress: () => Promise<`0x${string}`> = async () => {
    let addresses = await this.inner.getAddresses();
    return getAddress(addresses[0]);
  };

  readonly signMessage: (message: SignableMessage) => Promise<`0x${string}`> =
    async (message) => {
      const account = this.inner.account ?? (await this.getAddress());

      return this.inner.signMessage({ message, account });
    };

  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    typedData: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    const account = this.inner.account ?? (await this.getAddress());

    return this.inner.signTypedData({
      account,
      ...typedData,
    });
  };
}

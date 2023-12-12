import {
  getAddress,
  isHex,
  type ByteArray,
  type Hex,
  type WalletClient,
} from "viem";
import type { SignTypedDataParams } from "../account/types";
import type { SmartAccountSigner } from "./types";

export class WalletClientSigner implements SmartAccountSigner<WalletClient> {
  signerType: string;
  inner: WalletClient;

  constructor(client: WalletClient, signerType: string) {
    this.inner = client;
    if (!signerType) {
      throw new Error("Valid signerType param is required.");
    }
    this.signerType = signerType;
  }

  getAddress: () => Promise<`0x${string}`> = async () => {
    let addresses = await this.inner.getAddresses();
    return getAddress(addresses[0]);
  };

  readonly signMessage: (
    message: string | Hex | ByteArray
  ) => Promise<`0x${string}`> = async (message) => {
    const account = this.inner.account ?? (await this.getAddress());

    if (typeof message === "string" && !isHex(message)) {
      return this.inner.signMessage({
        account,
        message,
      });
    } else {
      return this.inner.signMessage({
        account,
        message: { raw: message },
      });
    }
  };

  signTypedData: (params: SignTypedDataParams) => Promise<`0x${string}`> =
    async (params) => {
      const account = this.inner.account ?? (await this.getAddress());

      return this.inner.signTypedData({
        account,
        ...params,
      });
    };
}

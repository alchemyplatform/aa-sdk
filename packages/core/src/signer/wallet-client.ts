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
    if (typeof message === "string" && !isHex(message)) {
      return this.inner.signMessage({
        account: await this.getAddress(),
        message,
      });
    } else {
      return this.inner.signMessage({
        account: await this.getAddress(),
        message: { raw: message },
      });
    }
  };

  signTypedData: (params: SignTypedDataParams) => Promise<`0x${string}`> =
    async (params) => {
      return this.inner.signTypedData({
        account: await this.getAddress(),
        ...params,
      });
    };
}

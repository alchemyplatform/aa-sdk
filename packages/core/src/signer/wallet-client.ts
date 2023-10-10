import {
  getAddress,
  isHex,
  type ByteArray,
  type Hex,
  type WalletClient,
} from "viem";
import type { SignTypedDataParams } from "../account/types";
import type { SmartAccountSigner } from "./types";

export class WalletClientSigner implements SmartAccountSigner {
  signerType: string;
  private client: WalletClient;

  constructor(client: WalletClient, signerType: string) {
    this.client = client;
    if (!signerType) {
      throw new Error("Valid signerType param is required.");
    }
    this.signerType = signerType;
  }

  getAddress: () => Promise<`0x${string}`> = async () => {
    let addresses = await this.client.getAddresses();
    return getAddress(addresses[0]);
  };

  readonly signMessage: (
    message: string | Hex | ByteArray
  ) => Promise<`0x${string}`> = async (message) => {
    if (typeof message === "string" && !isHex(message)) {
      return this.client.signMessage({
        account: await this.getAddress(),
        message,
      });
    } else {
      return this.client.signMessage({
        account: await this.getAddress(),
        message: { raw: message },
      });
    }
  };

  signTypedData: (params: SignTypedDataParams) => Promise<`0x${string}`> =
    async (params) => {
      return this.client.signTypedData({
        account: await this.getAddress(),
        ...params,
      });
    };
}

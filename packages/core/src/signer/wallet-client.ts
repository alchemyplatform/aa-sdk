import {
  getAddress,
  type ByteArray,
  type Hex,
  type WalletClient,
  isHex,
} from "viem";
import type { SmartAccountSigner } from "./types";
import type { SignTypedDataParams } from "../account/types";

export class WalletClientSigner implements SmartAccountSigner {
  private client: WalletClient;

  constructor(client: WalletClient) {
    this.client = client;
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

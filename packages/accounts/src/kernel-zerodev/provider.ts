import type { Hash, HttpTransport } from "viem";
import {
  type AccountMiddlewareFn,
  deepHexlify,
  resolveProperties,
  SmartAccountProvider,
} from "@alchemy/aa-core";

export class KernelAccountProvider extends SmartAccountProvider<HttpTransport> {
  signMessage = async (msg: string | Uint8Array): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }
    // @ts-ignore
    return this.account.signWithEip6492(msg);
  };
}

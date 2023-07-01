import type { Hash, HttpTransport } from "viem";
import { SmartAccountProvider } from "@alchemy/aa-core";

export class KernelAccountProvider extends SmartAccountProvider<HttpTransport> {
  signMessage = async (msg: string | Uint8Array): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }
    // @ts-expect-error: signWith6492 exists only on kernel account which is expected
    return this.account.signWithEip6492(msg);
  };
}

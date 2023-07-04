import type { Hash, HttpTransport } from "viem";
import { SmartAccountProvider } from "@alchemy/aa-core";
import { KernelSmartContractAccount } from "./account";

export class KernelAccountProvider extends SmartAccountProvider<HttpTransport> {
  signMessage = async (msg: string | Uint8Array): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }
    return (this.account as KernelSmartContractAccount).signWithEip6492(msg);
  };
}

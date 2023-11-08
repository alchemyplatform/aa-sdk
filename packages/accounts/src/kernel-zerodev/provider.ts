import { SmartAccountProvider } from "@alchemy/aa-core";
import type { Hash, HttpTransport } from "viem";
import { KernelSmartContractAccount } from "./account.js";

export class KernelAccountProvider<
  SignerClient extends any = any
> extends SmartAccountProvider<SignerClient, HttpTransport> {
  signMessage = async (msg: string | Uint8Array): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }
    return (this.account as KernelSmartContractAccount).signWithEip6492(msg);
  };
}

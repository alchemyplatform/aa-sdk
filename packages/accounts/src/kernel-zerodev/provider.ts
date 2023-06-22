import type { HttpTransport } from "viem";
import {
  type AccountMiddlewareFn,
  deepHexlify,
  resolveProperties,
  SmartAccountProvider,
} from "@alchemy/aa-core";

export class KernelAccountProvider extends SmartAccountProvider<HttpTransport> {
  gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.entryPointAddress
    );

    estimates.verificationGasLimit =
      (BigInt(estimates.verificationGasLimit) * 130n) / 100n;

    return {
      ...struct,
      ...estimates,
    };
  };

  request: (args: { method: string; params?: any[] }) => Promise<any> = async (
    args
  ) => {
    const { method, params } = args;
    if (method === "personal_sign") {
      if (!this.account) {
        throw new Error("account not connected!");
      }
      const [data, address] = params!;
      if (address !== (await this.getAddress())) {
        throw new Error(
          "cannot sign for address that is not the current account"
        );
      }
      // @ts-ignore
      return this.account.signWithEip6492(data);
    } else {
      return super.request(args);
    }
  };
}

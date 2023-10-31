import {
  SmartAccountProvider,
  type BatchUserOperationCallData,
  type SendUserOperationResult,
  type UserOperationCallData,
} from "@alchemy/aa-core";
import type { Hex, HttpTransport } from "viem";
import { BiconomySmartAccountV2 } from "./account.js";

export class BiconomyAccountProvider extends SmartAccountProvider<HttpTransport> {
  sendUserOperation = async (
    data: UserOperationCallData | BatchUserOperationCallData
  ): Promise<SendUserOperationResult> => {
    if (!this.account) {
      throw new Error("account not connected");
    }

    // create ethers tx from data
    if (!Array.isArray(data)) {
      data = [data];
    }
    const tx = data.map((d) => {
      return {
        to: d.target,
        data: d.data,
        value: d.value,
      };
    });
    const userOp = await (this.account as BiconomySmartAccountV2).buildUserOp(
      tx
    );

    const userOpResponse = await (
      this.account as BiconomySmartAccountV2
    ).sendUserOp(userOp);

    return {
      hash: userOpResponse.userOpHash as Hex,
      request: userOp as any,
    };
  };
}

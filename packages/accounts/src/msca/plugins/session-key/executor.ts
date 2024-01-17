import type { Address, BatchUserOperationCallData } from "@alchemy/aa-core";
import { encodeFunctionData, type Hex } from "viem";
import { IStandardExecutorAbi } from "../../abis/IStandardExecutor.js";
import type { Executor } from "../../builder/types";
import { SessionKeyPlugin, SessionKeyPluginAbi } from "./plugin.js";
import { SessionKeySigner } from "./signer.js";

/**
 * Use this with the `SessionKeySigner` {@link SessionKeySigner} in order to
 * receive the fallback functionality.
 *
 * @param acct the account this executor is attached to
 * @returns
 */
export const SessionKeyExecutor: Executor = (acct) => {
  const owner = acct.getOwner();
  if (!owner) {
    throw new Error("Account must be connected to an owner");
  }

  const isSessionKeyActive = async () => {
    const { readIsSessionKey } = SessionKeyPlugin.accountMethods(acct);
    const sessionKey = await owner.getAddress();

    // if this throws, then session key or the plugin is not installed
    if (await readIsSessionKey({ args: [sessionKey] }).catch(() => false)) {
      // TODO: Technically the key could be over its usage limit, but we'll come back to that later because
      // that requires the provider trying to validate a UO first
      return true;
    }

    return (
      // TODO: this is not a good way of doing this check, but we can come back to this later
      owner.signerType !== "alchemy:session-key" ||
      (owner.signerType === "alchemy:session-key" &&
        (owner as SessionKeySigner<any>).isKeyActive())
    );
  };

  return {
    async encodeExecute(
      target: Address,
      value: bigint,
      data: Hex
    ): Promise<`0x${string}`> {
      if (!isSessionKeyActive()) {
        return encodeFunctionData({
          abi: IStandardExecutorAbi,
          functionName: "execute",
          args: [target, value, data],
        });
      }

      return encodeFunctionData({
        abi: SessionKeyPluginAbi,
        functionName: "executeWithSessionKey",
        args: [[{ target, value, data }], await owner.getAddress()],
      });
    },

    async encodeBatchExecute(
      txs: BatchUserOperationCallData
    ): Promise<`0x${string}`> {
      if (!isSessionKeyActive()) {
        return encodeFunctionData({
          abi: IStandardExecutorAbi,
          functionName: "executeBatch",
          args: [
            txs.map((tx) => ({
              target: tx.target,
              data: tx.data,
              value: tx.value ?? 0n,
            })),
          ],
        });
      }

      return encodeFunctionData({
        abi: SessionKeyPluginAbi,
        functionName: "executeWithSessionKey",
        args: [
          txs.map((tx) => ({
            target: tx.target,
            data: tx.data,
            value: tx.value ?? 0n,
          })),
          await owner.getAddress(),
        ],
      });
    },
  };
};

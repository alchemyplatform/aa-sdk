import type { Address, BatchUserOperationCallData } from "@alchemy/aa-core";
import { encodeFunctionData, type Hex } from "viem";
import { IStandardExecutorAbi } from "../../abis/IStandardExecutor.js";
import type { Executor } from "../../builder/types";
import { SessionKeyPlugin, SessionKeyPluginAbi } from "./plugin.js";
import { SESSION_KEY_SIGNER_TYPE_PFX, SessionKeySigner } from "./signer.js";

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

  const isSessionKeyActive = async (pluginAddress?: Address) => {
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const contract = SessionKeyPlugin.getContract(
      acct.rpcProvider,
      pluginAddress
    );

    const [accountAddress, sessionKey] = await Promise.all([
      acct.getAddress(),
      owner.getAddress(),
    ]);

    // if this throws, then session key or the plugin is not installed
    if (
      await contract.read
        .isSessionKeyOf([accountAddress, sessionKey])
        .catch(() => false)
    ) {
      // TODO: Technically the key could be over its usage limit, but we'll come back to that later because
      // that requires the provider trying to validate a UO first
      return true;
    }

    return (
      // TODO: this is not a good way of doing this check, but we can come back to this later
      !owner.signerType.startsWith(SESSION_KEY_SIGNER_TYPE_PFX) ||
      (owner.signerType.startsWith(SESSION_KEY_SIGNER_TYPE_PFX) &&
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

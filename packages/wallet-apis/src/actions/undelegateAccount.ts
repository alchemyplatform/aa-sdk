import { zeroAddress, type Chain, type Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import { sendCalls, type SendCallsResult } from "./sendCalls.js";

export type UndelegateAccountParams = Prettify<{
  account?: AccountParam;
  chain?: Pick<Chain, "id">;
  capabilities?: {
    paymaster?: {
      policyId: string;
    };
  };
}>;

export type UndelegateAccountResult = Prettify<SendCallsResult>;

/**
 * Prepares, signs, and sends an EIP-7702 undelegation to remove delegation from an EOA.
 * Gas is sponsored by Alchemy (requires Enterprise plan).
 *
 * A BSO (Bundler Sponsorship Override) policy ID must be provided either via
 * `params.capabilities.paymaster.policyId` or pre-configured on the client via `policyIds`.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {UndelegateAccountParams} params - Parameters for undelegating the account
 * @param {AccountParam} [params.account] - The account to undelegate. Defaults to the client's account (signer address).
 * @param {object} [params.chain] - The chain. Defaults to the client's chain.
 * @param {object} [params.capabilities] - Optional capabilities. If omitted, falls back to the policy ID(s) set on the client.
 * @param {object} [params.capabilities.paymaster] - Paymaster capabilities. Requires a BSO policy ID.
 * @param {string} [params.capabilities.paymaster.policyId] - The BSO policy ID to use for gas sponsorship.
 * @returns {Promise<UndelegateAccountResult>} A Promise that resolves to the result containing the call ID.
 *
 * @example
 * ```ts
 * const result = await client.undelegateAccount();
 * const status = await client.waitForCallsStatus({ id: result.id });
 * ```
 */
export async function undelegateAccount(
  client: InnerWalletApiClient,
  params?: UndelegateAccountParams,
): Promise<UndelegateAccountResult> {
  const account = params?.account
    ? resolveAddress(params.account)
    : client.account.address;

  LOGGER.info("undelegateAccount:start", {
    account,
    chain: params?.chain,
  });

  const result = await sendCalls(client, {
    calls: [],
    account,
    ...(params?.chain != null ? { chain: params.chain } : {}),
    capabilities: {
      ...params?.capabilities,
      eip7702Auth: {
        delegation: zeroAddress,
      },
    },
  });

  LOGGER.info("undelegateAccount:done", { id: result.id });
  return result;
}

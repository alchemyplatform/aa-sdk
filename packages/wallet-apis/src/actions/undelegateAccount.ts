import type { Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import { prepareCalls } from "./prepareCalls.js";
import { signPreparedCalls } from "./signPreparedCalls.js";
import {
  sendPreparedCalls,
  type SendPreparedCallsResult,
} from "./sendPreparedCalls.js";
import { BaseError } from "@alchemy/common";
import { extractCapabilitiesForSending } from "../utils/capabilities.js";

export type UndelegateAccountParams = Prettify<{
  account?: AccountParam;
  chainId?: number;
  capabilities?: {
    paymaster?: {
      policyId: string;
    };
  };
}>;

export type UndelegateAccountResult = Prettify<SendPreparedCallsResult>;

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
 * @param {number} [params.chainId] - The chain ID. Defaults to the client's chain.
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
    chainId: params?.chainId,
  });

  // Step 1: Prepare — zero-address delegation means "undelegate"
  const prepared = await prepareCalls(client, {
    calls: [],
    account,
    ...(params?.chainId != null ? { chainId: params.chainId } : {}),
    capabilities: {
      ...params?.capabilities,
      eip7702Auth: {
        delegation: "0x0000000000000000000000000000000000000000",
      },
    },
  });

  if (prepared.type !== "authorization") {
    throw new BaseError(
      `Unexpected response type from wallet_prepareCalls: expected "authorization", got "${prepared.type}"`,
    );
  }

  LOGGER.debug("undelegateAccount:prepared");

  // Step 2: Sign
  const signedCalls = await signPreparedCalls(client, prepared);

  LOGGER.debug("undelegateAccount:signed");

  // Step 3: Send
  const sendCapabilities = extractCapabilitiesForSending(params?.capabilities);

  const result = await sendPreparedCalls(client, {
    ...signedCalls,
    ...(sendCapabilities != null ? { capabilities: sendCapabilities } : {}),
  });

  LOGGER.info("undelegateAccount:done", { id: result.id });
  return result;
}

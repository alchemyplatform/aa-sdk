import { AccountNotFoundError } from "@aa-sdk/core";
import { toHex, type Address, type IsUndefined } from "viem";
import type { InnerWalletApiClient } from "../../types.ts";
import type { Static } from "@sinclair/typebox";
import { wallet_prepareCalls } from "@alchemy/wallet-api-types/rpc";

export type GetAccountParam<TAccount> =
  IsUndefined<TAccount> extends true
    ? { account: Address }
    : { account?: Address };

export type PrepareCallsParams<
  TAccount extends Address | undefined = Address | undefined,
> = Omit<
  Static<
    (typeof wallet_prepareCalls)["properties"]["Request"]["properties"]["params"]
  >[0],
  "from" | "chainId"
> &
  (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never });

export type PrepareCallsResult = Static<
  typeof wallet_prepareCalls
>["ReturnType"];

/**
 * Prepares a set of contract calls for execution by building a user operation.
 * Returns the built user operation and a signature request that needs to be signed
 * before submitting to sendPreparedCalls.
 *
 * @param {InnerWalletApiClient<TAccount>} client - The wallet API client to use for the request
 * @param {PrepareCallsParams<TAccount>} params - Parameters for preparing calls
 * @param {Array<{to: Address, data?: Hex, value?: Hex}>} params.calls - Array of contract calls to execute
 * @param {Address} [params.from] - The address to execute the calls from (required if the client wasn't initialized with an account)
 * @param {object} [params.capabilities] - Optional capabilities to include with the request
 * @returns {Promise<PrepareCallsResult>} A Promise that resolves to the prepared calls result containing
 * the user operation data and signature request
 *
 * @example
 * ```ts
 * // Prepare a sponsored user operation call
 * const result = await client.prepareCalls({
 *   calls: [{
 *     to: "0x1234...",
 *     data: "0xabcdef...",
 *     value: "0x0"
 *   }],
 *   capabilities: {
 *     paymasterService: { policyId: "your-policy-id" }
 *   }
 * });
 * ```
 */
export async function prepareCalls<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: InnerWalletApiClient,
  params: PrepareCallsParams<TAccount>,
): Promise<PrepareCallsResult> {
  const from = params.from ?? client.account?.address;
  if (!from) {
    throw new AccountNotFoundError();
  }

  if (client.policyIds && !params.capabilities?.paymasterService) {
    params.capabilities = {
      ...params.capabilities,
      paymasterService: { policyIds: client.policyIds },
    };
  }

  return await client.request({
    method: "wallet_prepareCalls",
    params: [
      {
        ...params,
        chainId: toHex(client.chain.id),
        from,
      },
    ],
  });
}

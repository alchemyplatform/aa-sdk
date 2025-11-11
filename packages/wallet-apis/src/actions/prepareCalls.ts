import { toHex, type Address, type IsUndefined, type Prettify } from "viem";
import type { InnerWalletApiClient, OptionalChainId } from "../types.ts";
import { requestWithBreadcrumb } from "@alchemy/common";
import { AccountNotFoundError } from "@alchemy/common";
import { LOGGER } from "../logger.js";
import { mergeClientCapabilities } from "../utils/capabilities.js";
import type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";

type RpcSchema = Extract<
  WalletServerRpcSchemaType,
  {
    Request: {
      method: "wallet_prepareCalls";
    };
  }
>;

export type PrepareCallsParams<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  OptionalChainId<Omit<RpcSchema["Request"]["params"][0], "from">> &
    (IsUndefined<TAccount> extends true ? { from: Address } : { from?: never })
>;

export type PrepareCallsResult = Prettify<RpcSchema["ReturnType"]>;

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
    LOGGER.warn("prepareCalls:no-from", { hasClientAccount: !!client.account });
    throw new AccountNotFoundError();
  }

  const capabilities = mergeClientCapabilities(client, params.capabilities);

  LOGGER.debug("prepareCalls:start", {
    callsCount: params.calls?.length,
    hasCapabilities: !!params.capabilities,
  });
  const res = await requestWithBreadcrumb(
    client as any,
    "wallet-apis:wallet_prepareCalls",
    {
      method: "wallet_prepareCalls",
      params: [
        {
          ...params,
          chainId: params.chainId ?? toHex(client.chain.id),
          from,
          capabilities,
        },
      ],
    },
  );
  LOGGER.debug("prepareCalls:done");
  return res;
}

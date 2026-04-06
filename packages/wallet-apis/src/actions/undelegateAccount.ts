import type { Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import {
  wallet_prepareCalls as PrepareMethodSchema,
  wallet_sendPreparedCalls as SendMethodSchema,
} from "@alchemy/wallet-api-types/rpc";
import {
  methodSchema,
  encode,
  decode,
  type MethodResponse,
} from "../utils/schema.js";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { BaseError } from "@alchemy/common";
import { mergeClientCapabilities } from "../utils/capabilities.js";

const prepareSchema = methodSchema(PrepareMethodSchema);
const sendSchema = methodSchema(SendMethodSchema);

type SendPreparedCallsResponse = MethodResponse<typeof SendMethodSchema>;

export type UndelegateAccountParams = Prettify<{
  account?: AccountParam;
  chainId?: number;
  capabilities?: {
    paymaster?: {
      policyId: string;
    };
  };
}>;

export type UndelegateAccountResult = Prettify<SendPreparedCallsResponse>;

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
  const from = params?.account
    ? resolveAddress(params.account)
    : client.account.address;

  const chainId = params?.chainId ?? client.chain.id;

  const capabilities = mergeClientCapabilities(client, params?.capabilities);

  LOGGER.info("undelegateAccount:start", { account: from, chainId });

  // Step 1: Prepare — wallet_prepareCalls with zero-address delegation, no calls
  const prepareRpcParams = encode(prepareSchema.request, {
    from,
    chainId,
    capabilities: {
      ...capabilities,
      eip7702Auth: {
        delegation: "0x0000000000000000000000000000000000000000",
      },
    },
  });

  const prepareRpcResp = await client.request({
    method: "wallet_prepareCalls",
    params: [prepareRpcParams],
  });

  const prepared = decode(prepareSchema.response, prepareRpcResp);

  if (prepared.type !== "authorization") {
    throw new BaseError(
      `Unexpected response type from wallet_prepareCalls: expected "authorization", got "${prepared.type}"`,
    );
  }

  LOGGER.debug("undelegateAccount:prepared");

  // Step 2: Sign the authorization
  const signature = await signSignatureRequest(client, {
    type: "eip7702Auth",
    data: {
      ...prepared.data,
      chainId: prepared.chainId,
    },
  });

  LOGGER.debug("undelegateAccount:signed");

  // Step 3: Send — wallet_sendPreparedCalls with the signed authorization
  const { signatureRequest: _, ...rest } = prepared;
  const sendRpcParams = encode(sendSchema.request, {
    ...rest,
    signature,
  });

  const sendRpcResp = await client.request({
    method: "wallet_sendPreparedCalls",
    params: [sendRpcParams],
  });

  const result = decode(sendSchema.response, sendRpcResp);
  LOGGER.info("undelegateAccount:done", { id: result.id });
  return result;
}

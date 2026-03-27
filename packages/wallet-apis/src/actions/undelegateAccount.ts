import type { Prettify } from "viem";
import type { InnerWalletApiClient } from "../types.js";
import { LOGGER } from "../logger.js";
import { resolveAddress, type AccountParam } from "../utils/resolve.js";
import {
  wallet_prepareUndelegation as PrepareMethodSchema,
  wallet_sendUndelegation as SendMethodSchema,
} from "@alchemy/wallet-api-types/rpc";
import {
  methodSchema,
  encode,
  decode,
  type MethodResponse,
} from "../utils/schema.js";
import { signSignatureRequest } from "./signSignatureRequest.js";

const prepareSchema = methodSchema(PrepareMethodSchema);
const sendSchema = methodSchema(SendMethodSchema);

type SendUndelegationResponse = MethodResponse<typeof SendMethodSchema>;

export type UndelegateAccountParams = Prettify<{
  account?: AccountParam;
  chainId?: number;
}>;

export type UndelegateAccountResult = Prettify<SendUndelegationResponse>;

/**
 * Prepares, signs, and sends an EIP-7702 undelegation to remove delegation from an EOA.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {UndelegateAccountParams} params - Parameters for undelegating the account
 * @param {AccountParam} [params.account] - The account to undelegate. Defaults to the client's account (signer address).
 * @param {number} [params.chainId] - The chain ID. Defaults to the client's chain.
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

  const chainId = params?.chainId ?? client.chain.id;

  LOGGER.info("undelegateAccount:start", { account, chainId });

  // Step 1: Prepare undelegation
  const prepareRpcParams = encode(prepareSchema.request, {
    account,
    chainId,
  });

  const prepareRpcResp = await client.request({
    method: "wallet_prepareUndelegation",
    params: [prepareRpcParams],
  });

  const prepared = decode(prepareSchema.response, prepareRpcResp);
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

  // Step 3: Send the signed undelegation
  const { type: _, signatureRequest: __, ...rest } = prepared;
  const sendRpcParams = encode(sendSchema.request, {
    ...rest,
    signature,
  });

  const sendRpcResp = await client.request({
    method: "wallet_sendUndelegation",
    params: [sendRpcParams],
  });

  const result = decode(sendSchema.response, sendRpcResp);
  LOGGER.info("undelegateAccount:done", { id: result.id });
  return result;
}

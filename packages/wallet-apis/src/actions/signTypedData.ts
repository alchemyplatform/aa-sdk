import {
  type Address,
  type Hex,
  type Prettify,
  type TypedDataDefinition,
} from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import { requestAccount } from "./requestAccount.js";
import { prepareSign } from "./prepareSign.js";
import { signSignatureRequest } from "./signSignatureRequest.js";
import { formatSign } from "./formatSign.js";
import { typedDataToJsonSafe } from "../utils/format.js";
import type { SignerClient } from "../types.js";

export type SignTypedDataParams = Prettify<
  TypedDataDefinition & {
    account?: Address;
  }
>;

export type SignTypedDataResult = Prettify<Hex>;

/**
 * Signs typed data (EIP-712) using the smart account.
 * This method requests the account associated with the signer and uses it to sign the typed data.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SignerClient} signerClient - The wallet client to use for signing
 * @param {TypedDataDefinition} params - The typed data to sign, following EIP-712 format
 * @returns {Promise<SignTypedDataResult>} A Promise that resolves to the signature as a hex string
 *
 * @example
 * ```ts
 * // Sign typed data
 * const signature = await client.signTypedData({
 *   domain: {
 *     name: 'Example DApp',
 *     version: '1',
 *     chainId: 1,
 *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
 *   },
 *   types: {
 *     Person: [
 *       { name: 'name', type: 'string' },
 *       { name: 'wallet', type: 'address' }
 *     ]
 *   },
 *   primaryType: 'Person',
 *   message: {
 *     name: 'John Doe',
 *     wallet: '0xAaAaAaAaAaAaAaAaAaAAAAAAAAaaaAaAaAaaAaAa'
 *   }
 * });
 * ```
 */

export async function signTypedData(
  client: InnerWalletApiClient,
  signerClient: SignerClient,
  params: SignTypedDataParams,
): Promise<SignTypedDataResult> {
  const accountAddress = params.account ?? client.account?.address;
  const account = await requestAccount(
    client,
    signerClient,
    accountAddress != null ? { accountAddress } : undefined,
  );

  const prepared = await prepareSign(client, {
    from: account.address,
    signatureRequest: {
      type: "eth_signTypedData_v4",
      data: typedDataToJsonSafe(params),
    },
  });

  const signed = await signSignatureRequest(
    signerClient,
    prepared.signatureRequest,
  );

  const formatted = await formatSign(client, {
    from: account.address,
    signature: {
      type: "ecdsa",
      data: signed.data,
    },
  });

  return formatted.signature;
}

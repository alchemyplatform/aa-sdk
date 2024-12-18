import { AccountNotFoundError } from "../../errors/account.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultUserOpSigner } from "./userOpSigner.js";

/**
 * Provides a default middleware function for signing user operations with a client account when using ERC-7702 to upgrade local accounts to smart accounts.
 * If the SmartAccount doesn't support `signAuthorization`, then this just runs the default UserOpSigner middleware
 *
 * @param {UserOperationStruct} struct The user operation structure to be signed
 * @param {*} params The middleware context containing the client and account information
 * @param {Client} params.client The client object, which should include account and chain information
 * @param {Account} [params.account] Optional, the account used for signing, defaults to the client's account if not provided
 * @returns {Promise<UserOperationStruct>} A promise that resolves to the signed user operation structure
 */
export const default7702UserOpSigner: ClientMiddlewareFn = async (
  struct,
  params
) => {
  const uo = await defaultUserOpSigner(struct, params);
  const account = params.account ?? params.client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!account.signAuthorization) {
    console.log("account does not support signAuthorization");
    return uo;
  }

  const code =
    (await params.client.getCode({ address: account.address })) ?? "0x";
  // TODO: this isn't the cleanest because now the account implementation HAS to know that it needs to return an impl address
  // even if the account is not deployed

  const implAddress = await account.getImplementationAddress();
  if (code === "0xef0100" + implAddress.slice(2)) {
    console.log("account is already 7702 delegated to a smart account");
    return uo;
  }

  console.log("signing 7702 authorization");

  return {
    ...uo,
    authorizationTuple: await account.signAuthorization(),
  };
};

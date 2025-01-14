import { toHex } from "viem";
import { isSmartAccountWithSigner } from "../../account/smartContractAccount.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { ChainNotFoundError } from "../../errors/client.js";
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
  const { client } = params;

  if (!account || !isSmartAccountWithSigner(account)) {
    throw new AccountNotFoundError();
  }

  const signer = account.getSigner();

  if (!signer.signAuthorization) {
    console.log("account does not support signAuthorization");
    return uo;
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const code = (await client.getCode({ address: account.address })) ?? "0x";
  // TODO: this isn't the cleanest because now the account implementation HAS to know that it needs to return an impl address
  // even if the account is not deployed

  const implAddress = await account.getImplementationAddress();

  const expectedCode = "0xef0100" + implAddress.slice(2);

  if (code.toLowerCase() === expectedCode.toLowerCase()) {
    return uo;
  }

  const accountNonce = await params.client.getTransactionCount({
    address: account.address,
  });

  const {
    r,
    s,
    v,
    yParity = v ? v - 27n : undefined,
  } = await signer.signAuthorization({
    chainId: client.chain.id,
    contractAddress: implAddress,
    nonce: accountNonce,
  });

  return {
    ...uo,
    authorizationTuple: {
      chainId: client.chain.id,
      nonce: toHex(accountNonce), // deepHexlify doesn't encode number(0) correctly, it returns "0x"
      address: implAddress,
      r,
      s,
      yParity: Number(yParity),
    },
  };
};

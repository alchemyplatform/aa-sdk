import { toHex } from "viem";
import { isSmartAccountWithSigner } from "../../account/smartContractAccount.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { ChainNotFoundError } from "../../errors/client.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultUserOpSigner } from "./userOpSigner.js";

/**
 * Provides a default middleware function for signing user operations with a client account when using ERC-7702 to upgrade local accounts to smart accounts.
 * If the SmartAccount doesn't support `signAuthorization`, then this just runs the provided `signUserOperation` middleware
 *
 * @param {ClientMiddlewareFn} [userOpSigner] Optional user operation signer function
 * @returns {Function} An async function that processes the user operation and returns the authorized operation with an authorization tuple if necessary
 */
export const default7702UserOpSigner: (
  userOpSigner?: ClientMiddlewareFn
) => ClientMiddlewareFn =
  (userOpSigner?: ClientMiddlewareFn) => async (struct, params) => {
    const userOpSigner_ = userOpSigner ?? defaultUserOpSigner;

    const uo = await userOpSigner_(struct, params);

    const account = params.account ?? params.client.account;
    const { client } = params;

    if (!account || !isSmartAccountWithSigner(account)) {
      throw new AccountNotFoundError();
    }

    const signer = account.getSigner();

    if (!signer.signAuthorization) {
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

    if (yParity === undefined) {
      throw new Error("Invalid signature: missing yParity or v");
    }

    return {
      ...uo,
      authorizationTuple: {
        chainId: client.chain.id,
        nonce: toHex(accountNonce), // deepHexlify doesn't encode number(0) correctly, it returns "0x"
        address: implAddress,
        r,
        s,
        yParity: toHex(yParity),
      },
    };
  };

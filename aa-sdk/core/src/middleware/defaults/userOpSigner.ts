import { AccountNotFoundError } from "../../errors/account.js";
import { ChainNotFoundError } from "../../errors/client.js";
import { InvalidUserOperationError } from "../../errors/useroperation.js";
import {
  deepHexlify,
  isValidRequest,
  resolveProperties,
} from "../../utils/index.js";
import type { ClientMiddlewareFn } from "../types";

/**
 * Provides a default middleware function for signing user operations with a client account. This function validates the request and adds the signature to it.
 * This is already included in the client returned from `createSmartAccountClient`
 *
 * @param {UserOperationStruct} struct The user operation structure to be signed
 * @param {*} context The middleware context containing the client and account information
 * @param {Client} context.client The client object, which should include account and chain information
 * @param {Account} [context.account] Optional, the account used for signing, defaults to the client's account if not provided
 * @returns {Promise<UserOperationStruct>} A promise that resolves to the signed user operation structure
 */
export const defaultUserOpSigner: ClientMiddlewareFn = async (
  struct,
  { client, account = client.account },
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client?.chain) {
    throw new ChainNotFoundError();
  }

  const resolvedStruct = await resolveProperties(struct);
  const request = deepHexlify(resolvedStruct);
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(resolvedStruct);
  }

  return {
    ...resolvedStruct,
    signature: await account.signUserOperationHash(
      account.getEntryPoint().getUserOperationHash(request),
    ),
  };
};

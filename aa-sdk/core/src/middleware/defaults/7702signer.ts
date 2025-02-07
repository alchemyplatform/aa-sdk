import { toHex } from "viem";
import { isSmartAccountWithSigner } from "../../account/smartContractAccount.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { ChainNotFoundError } from "../../errors/client.js";
import type { ClientMiddlewareFn } from "../types";
import { defaultUserOpSigner } from "./userOpSigner.js";

/**
 * Provides a default middleware function for signing user operations with a client account when using EIP-7702 delegated accounts.
 * If the signer doesn't support `signAuthorization`, then this just runs the provided `signUserOperation` middleware.
 * This function is only compatible with accounts using EntryPoint v0.7.0, and the account must have an implementation address defined in `getImplementationAddress()`.
 *
 * @example
 * ```ts twoslash
 * import {
 *   default7702GasEstimator,
 *   default7702UserOpSigner,
 *   createSmartAccountClient,
 *   type SmartAccountClient,
 * } from "@aa-sdk/core";
 * import {
 *   createModularAccountV2,
 *   type CreateModularAccountV2ClientParams,
 * } from "@account-kit/smart-contracts";
 *
 * async function createSMA7702AccountClient(
 *   config: CreateModularAccountV2ClientParams
 * ): Promise<SmartAccountClient> {
 *   const sma7702Account = await createModularAccountV2({ ...config, mode: "7702" });
 *
 *   return createSmartAccountClient({
 *     account: sma7702Account,
 *     gasEstimator: default7702GasEstimator(config.gasEstimator),
 *     signUserOperation: default7702UserOpSigner(config.signUserOperation),
 *     ...config,
 *   });
 * }
 * ```
 *
 * @param {ClientMiddlewareFn} [userOpSigner] Optional user operation signer function
 * @returns {Function} A middleware function that signs EIP-7702 authorization tuples if necessary, and also uses the provided or default user operation signer to generate the user op signature.
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

    const implAddress = await account.getImplementationAddress();

    const expectedCode = "0xef0100" + implAddress.slice(2);

    if (code.toLowerCase() === expectedCode.toLowerCase()) {
      // If the delegation already matches the expected, then we don't need to sign and include an authorization tuple.
      return uo;
    }

    const accountNonce = await params.client.getTransactionCount({
      address: account.address,
    });

    const authSignature = await signer.signAuthorization({
      chainId: client.chain.id,
      contractAddress: implAddress,
      nonce: accountNonce,
    });

    const { r, s } = authSignature;

    const yParity = authSignature.yParity ?? authSignature.v - 27n;

    return {
      ...uo,
      eip7702auth: {
        // deepHexlify doesn't encode number(0) correctly, it returns "0x"
        chainId: toHex(client.chain.id),
        nonce: toHex(accountNonce),
        address: implAddress,
        r,
        s,
        yParity: toHex(yParity),
      },
    };
  };

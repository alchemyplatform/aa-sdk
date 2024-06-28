import type { Address } from "abitype";
import type { Hash, Hex, HttpTransport, Transport } from "viem";
import type { SignTypedDataParameters } from "viem/accounts";
import type { z } from "zod";
import type { BundlerClient } from "../client/bundlerClient";
import type { SmartAccountSigner } from "../signer/types";
import type { BatchUserOperationCallData } from "../types";
import type {
  SimpleSmartAccountParamsSchema,
  createBaseSmartAccountParamsSchema,
} from "./schema";

/** @deprecated */
export type SignTypedDataParams = Omit<SignTypedDataParameters, "privateKey">;

/**
 * @deprecated don't use base smart account anymore, migrate to using toSmartContractAccount instead
 */
export type BaseSmartAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = z.input<
  ReturnType<typeof createBaseSmartAccountParamsSchema<TTransport, TSigner>>
>;

export type SimpleSmartAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = z.input<
  ReturnType<typeof SimpleSmartAccountParamsSchema<TTransport, TSigner>>
>;

/**
 * @deprecated use `toSmartContractAccount` instead for creating instances of smart accounts
 */
export interface ISmartContractAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> {
  /**
   * The RPC provider the account uses to make RPC calls
   */
  readonly rpcProvider:
    | BundlerClient<TTransport>
    | BundlerClient<HttpTransport>;

  /**
   * @returns the init code for the account
   */
  getInitCode(): Promise<Hex>;

  /**
   * This is useful for estimating gas costs. It should return a signature that doesn't cause the account to revert
   * when validation is run during estimation.
   *
   * @returns a dummy signature that doesn't cause the account to revert during estimation
   */
  getDummySignature(): Hex | Promise<Hex>;

  /**
   * Encodes a call to the account's execute function.
   *
   * @param target - the address receiving the call data
   * @param value - optionally the amount of native token to send
   * @param data - the call data or "0x" if empty
   */
  encodeExecute(target: string, value: bigint, data: string): Promise<Hex>;

  /**
   * Encodes a batch of transactions to the account's batch execute function.
   * NOTE: not all accounts support batching.
   *
   * @param txs - An Array of objects containing the target, value, and data for each transaction
   * @returns the encoded callData for a UserOperation
   */
  encodeBatchExecute(txs: BatchUserOperationCallData): Promise<Hex>;

  /**
   * @returns the nonce of the account
   */
  getNonce(): Promise<bigint>;

  /**
   * If your account handles 1271 signatures of personal_sign differently
   * than it does UserOperations, you can implement two different approaches to signing
   *
   * @param uoHash -- The hash of the UserOperation to sign
   * @returns the signature of the UserOperation
   */
  signUserOperationHash(uoHash: Hash): Promise<Hash>;

  /**
   * Returns a signed and prefixed message.
   *
   * @param msg - the message to sign
   * @returns the signature of the message
   */
  signMessage(msg: string | Uint8Array | Hex): Promise<Hex>;

  /**
   * Signs a typed data object as per ERC-712
   *
   * @param params - {@link SignTypedDataParams}
   * @returns the signed hash for the message passed
   */
  signTypedData(params: SignTypedDataParams): Promise<Hash>;

  /**
   * If the account is not deployed, it will sign the message and then wrap it in 6492 format
   *
   * @param msg - the message to sign
   * @returns ths signature wrapped in 6492 format
   */
  signMessageWith6492(msg: string | Uint8Array | Hex): Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the typed data blob and then wrap it in 6492 format
   *
   * @param params - {@link SignTypedDataParams}
   * @returns the signed hash for the params passed in wrapped in 6492 format
   */
  signTypedDataWith6492(params: SignTypedDataParams): Promise<Hash>;

  /**
   * @returns the address of the account
   */
  getAddress(): Promise<Address>;

  /**
   * @returns the current account signer instance that the smart account client
   * operations are being signed with.
   *
   * The signer is expected to be the owner or one of the owners of the account
   * for the signatures to be valid for the acting account.
   */
  getSigner(): TSigner;

  /**
   * The factory address of the smart account created by the factory
   *
   * @returns the address of the factory contract for the smart account
   */
  getFactoryAddress(): Address;

  /**
   * The entrypoint address is the address ERC 4337 entrypoint singleton contract
   * that this smart account and the connected bundler client use
   *
   * @returns the address of the entry point contract for the smart account
   */
  getEntryPointAddress(): Address;

  /**
   * Allows you to add additional functionality and utility methods to this account
   * via a decorator pattern.
   *
   * NOTE: this method does not allow you to override existing methods on the account.
   *
   * @example
   * ```ts
   * const account = new BaseSmartCobntractAccount(...).extend((account) => ({
   *  readAccountState: async (...args) => {
   *    return this.rpcProvider.readContract({
   *        address: await this.getAddress(),
   *        abi: ThisContractsAbi
   *        args: args
   *    });
   *  }
   * }));
   *
   * account.debugSendUserOperation(...);
   * ```
   *
   * @param extendFn -- this function gives you access to the created account instance and returns an object
   * with the extension methods
   * @returns -- the account with the extension methods added
   */
  extend: <R>(extendFn: (self: this) => R) => this & R;

  encodeUpgradeToAndCall: (
    upgradeToImplAddress: Address,
    upgradeToInitData: Hex
  ) => Promise<Hex>;
}

import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { SignTypedDataParameters } from "viem/accounts";
import type { BatchUserOperationCallData } from "../types";

export type SignTypedDataParams = Omit<SignTypedDataParameters, "privateKey">;

export interface ISmartContractAccount {
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
  getDummySignature(): Hex;

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
   * @param txs - An Array of objects containing the target, value, and data for each transaction
   * @returns the encoded callData for a UserOperation
   */
  encodeBatchExecute(txs: BatchUserOperationCallData): Promise<Hex>;

  /**
   * @returns the nonce of the account
   */
  getNonce(): Promise<bigint>;

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
}

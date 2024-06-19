import {
  AccountNotFoundError,
  resolveProperties,
  type BatchUserOperationCallData,
  type BundlerClient,
  type GetEntryPointFromAccount,
  type SmartContractAccount,
  type UserOperationCallData,
  type UserOperationOverrides,
} from "@aa-sdk/core";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import type { Deferrable } from "@ethersproject/properties";
import {
  type TransactionRequest,
  type TransactionResponse,
} from "@ethersproject/providers";
import { isHex, toBytes, type Transport } from "viem";
import { EthersProviderAdapter } from "./provider-adapter.js";

const hexlifyOptional = (value: any): `0x${string}` | undefined => {
  if (value == null) {
    return undefined;
  }

  return hexlify(value) as `0x${string}`;
};

/**
 * Implementation of the ethers Signer interface to use with Smart Contract Accounts
 */
export class AccountSigner<
  TAccount extends SmartContractAccount = SmartContractAccount,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> extends Signer {
  readonly account: TAccount;

  sendUserOperation;
  waitForUserOperationTransaction;

  /**
   * Creates a new AccountSigner with the given ethers Provider and Smart Contract Account
   *
   * @template {SmartContractAccount} TAccount the type of the smart contract account
   * @param {EthersProviderAdapter} provider the ethers provider to use
   * @param {TAccount} account the smart contract account that will be used to sign user ops and send them
   */
  constructor(public provider: EthersProviderAdapter, account: TAccount) {
    super();
    this.account = account;

    this.sendUserOperation = (
      args: UserOperationCallData | BatchUserOperationCallData,
      overrides?: UserOperationOverrides<TEntryPointVersion>
    ) =>
      this.provider.accountProvider.sendUserOperation({
        uo: args,
        account,
        overrides,
      });

    this.waitForUserOperationTransaction =
      this.provider.accountProvider.waitForUserOperationTransaction.bind(
        this.provider.accountProvider
      );
  }

  async getAddress(): Promise<string> {
    if (!this.account) {
      throw new AccountNotFoundError();
    }

    return this.account.address;
  }

  signMessage(message: string | Uint8Array): Promise<string> {
    if (!this.account) {
      throw new AccountNotFoundError();
    }

    return this.account.signMessage({
      message:
        typeof message === "string" && !isHex(message)
          ? message
          : { raw: isHex(message) ? toBytes(message) : message },
    });
  }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.provider.accountProvider.account || !this.account) {
      throw new AccountNotFoundError();
    }

    const resolved = await resolveProperties(transaction);
    const txHash = await this.provider.accountProvider.sendTransaction({
      to: resolved.to as `0x${string}` | undefined,
      data: hexlifyOptional(resolved.data),
      chain: this.provider.accountProvider.chain,
      account: this.account,
    });

    return this.provider.getTransaction(txHash);
  }

  signTransaction(
    _transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    throw new Error(
      "Transaction signing is not supported, use sendUserOperation instead"
    );
  }

  getPublicErc4337Client(): BundlerClient<Transport> {
    return this.provider.getBundlerClient();
  }

  connect(provider: EthersProviderAdapter): AccountSigner<TAccount> {
    this.provider = provider;

    return this;
  }
}

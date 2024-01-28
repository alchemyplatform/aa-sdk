import {
  resolveProperties,
  type BatchUserOperationCallData,
  type PublicErc4337Client,
  type SmartContractAccount,
  type UserOperationCallData,
  type UserOperationOverrides,
} from "@alchemy/aa-core";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import type { Deferrable } from "@ethersproject/properties";
import {
  type TransactionRequest,
  type TransactionResponse,
} from "@ethersproject/providers";
import { isHex } from "viem";
import { EthersProviderAdapter } from "./provider-adapter.js";

const hexlifyOptional = (value: any): `0x${string}` | undefined => {
  if (value == null) {
    return undefined;
  }

  return hexlify(value) as `0x${string}`;
};

export class AccountSigner<
  TAccount extends SmartContractAccount = SmartContractAccount
> extends Signer {
  readonly account: TAccount;

  sendUserOperation;
  waitForUserOperationTransaction;

  constructor(public provider: EthersProviderAdapter, account: TAccount) {
    super();
    this.account = account;

    this.sendUserOperation = (
      args: UserOperationCallData | BatchUserOperationCallData,
      overrides?: UserOperationOverrides
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
      throw new Error(
        "connect the signer to a provider that has a connected account"
      );
    }

    return this.account.address;
  }

  signMessage(message: string | Uint8Array): Promise<string> {
    if (!this.account) {
      throw new Error(
        "connect the signer to a provider that has a connected account"
      );
    }

    return this.account.signMessage({
      message:
        typeof message === "string" && !isHex(message)
          ? message
          : { raw: message },
    });
  }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    if (!this.provider.accountProvider.account || !this.account) {
      throw new Error(
        "connect the signer to a provider that has a connected account"
      );
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

  getPublicErc4337Client(): PublicErc4337Client {
    return this.provider.getPublicErc4337Client();
  }

  connect(provider: EthersProviderAdapter): AccountSigner<TAccount> {
    this.provider = provider;

    return this;
  }
}

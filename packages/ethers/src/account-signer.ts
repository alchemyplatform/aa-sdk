import {
  BaseSmartContractAccount,
  resolveProperties,
  type AccountMiddlewareFn,
  type FeeDataMiddleware,
  type GasEstimatorMiddleware,
  type PaymasterAndDataMiddleware,
  type PublicErc4337Client,
} from "@alchemy/aa-core";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import type { Deferrable } from "@ethersproject/properties";
import {
  type TransactionRequest,
  type TransactionResponse,
} from "@ethersproject/providers";
import { EthersProviderAdapter } from "./provider-adapter.js";

const hexlifyOptional = (value: any): `0x${string}` | undefined => {
  if (value == null) {
    return undefined;
  }

  return hexlify(value) as `0x${string}`;
};

export interface SmartAccountProviderOpts {
  /**
   * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
   */
  txMaxRetries?: number;

  /**
   * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000n)
   */
  txRetryIntervalMs?: number;

  /**
   * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
   */
  txRetryMulitplier?: number;

  /**
   * used when computing the fees for a user operation (default: 100_000_000n)
   */
  minPriorityFeePerBid?: bigint;
}

export class AccountSigner extends Signer {
  private account?: BaseSmartContractAccount;

  private txMaxRetries: number;
  private txRetryIntervalMs: number;
  private txRetryMulitplier: number;

  sendUserOperation;
  getTransaction;
  getUserOperationByHash;
  getUserOperationReceipt;

  constructor(
    readonly provider: EthersProviderAdapter,
    opts?: SmartAccountProviderOpts
  ) {
    super();
    this.account = this.provider.accountProvider.account;

    this.txMaxRetries = opts?.txMaxRetries ?? 5;
    this.txRetryIntervalMs = opts?.txRetryIntervalMs ?? 2000;
    this.txRetryMulitplier = opts?.txRetryMulitplier ?? 1.5;

    this.sendUserOperation =
      this.provider.accountProvider.sendUserOperation.bind(
        this.provider.accountProvider
      );
    this.getTransaction = this.provider.getTransaction.bind(this.provider);
    this.getUserOperationByHash =
      this.provider.accountProvider.getUserOperationByHash.bind(
        this.provider.accountProvider
      );
    this.getUserOperationReceipt =
      this.provider.accountProvider.getUserOperationReceipt.bind(
        this.provider.accountProvider
      );
  }

  getAddress(): Promise<string> {
    if (!this.account) {
      throw new Error(
        "connect the signer to a provider that has a connected account"
      );
    }

    return this.account.getAddress();
  }

  signMessage(message: string | Uint8Array): Promise<string> {
    if (!this.account) {
      throw new Error(
        "connect the signer to a provider that has a connected account"
      );
    }

    return this.account.signMessage(message);
  }

  withPaymasterMiddleware = (overrides: {
    dummyPaymasterDataMiddleware?: PaymasterAndDataMiddleware;
    paymasterDataMiddleware?: PaymasterAndDataMiddleware;
  }): this => {
    this.provider.withPaymasterMiddleware(overrides);
    return this;
  };

  withGasEstimator = (override: GasEstimatorMiddleware): this => {
    this.provider.withGasEstimator(override);
    return this;
  };

  withFeeDataGetter = (override: FeeDataMiddleware): this => {
    this.provider.withFeeDataGetter(override);
    return this;
  };

  withCustomMiddleware = (override: AccountMiddlewareFn): this => {
    this.provider.withCustomMiddleware(override);
    return this;
  };

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    const resolved = await resolveProperties(transaction);
    const txHash = await this.provider.accountProvider.sendTransaction({
      // TODO: need to support gas fields as well
      from: (await this.getAddress()) as `0x${string}`,
      to: resolved.to as `0x${string}` | undefined,
      data: hexlifyOptional(resolved.data),
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

  waitForUserOperationTransaction = async (
    hash: `0x${string}`
  ): Promise<`0x${string}`> => {
    for (let i = 0; i < this.txMaxRetries; i++) {
      const txRetryIntervalWithJitterMs =
        this.txRetryIntervalMs * Math.pow(this.txRetryMulitplier, i) +
        Math.random() * 100;

      await new Promise((resolve) =>
        setTimeout(resolve, txRetryIntervalWithJitterMs)
      );
      const receipt = await this.getUserOperationReceipt(hash as `0x${string}`)
        // TODO: should maybe log the error?
        .catch(() => null);
      if (receipt) {
        return this.getTransaction(receipt.receipt.transactionHash).then(
          (x) => x.hash as `0x${string}`
        );
      }
    }

    throw new Error("Failed to find transaction for User Operation");
  };

  getPublicErc4337Client(): PublicErc4337Client {
    return this.provider.getPublicErc4337Client();
  }

  connect(provider: EthersProviderAdapter): AccountSigner {
    return new AccountSigner(provider);
  }
}

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
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> extends Signer {
  readonly account: TAccount;

  sendUserOperation;
  waitForUserOperationTransaction;

  /**
   * Creates a new AccountSigner with the given ethers Provider and Smart Contract Account
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   * ```
   *
   * @template {SmartContractAccount} TAccount the type of the smart contract account
   * @param {EthersProviderAdapter} provider the ethers provider to use
   * @param {TAccount} account the smart contract account that will be used to sign user ops and send them
   */
  constructor(
    public provider: EthersProviderAdapter,
    account: TAccount,
  ) {
    super();
    this.account = account;

    this.sendUserOperation = (
      args: UserOperationCallData | BatchUserOperationCallData,
      overrides?: UserOperationOverrides<TEntryPointVersion>,
    ) =>
      this.provider.accountProvider.sendUserOperation({
        uo: args,
        account,
        overrides,
      });

    this.waitForUserOperationTransaction =
      this.provider.accountProvider.waitForUserOperationTransaction.bind(
        this.provider.accountProvider,
      );
  }

  /**
   * Returns the account address if the account exists.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   *
   * const address = await signer.getAddress();
   * ```
   *
   * @returns {Promise<string>} a promise that resolves to the account address
   * @throws {AccountNotFoundError} if the account is not found
   */ async getAddress(): Promise<string> {
    if (!this.account) {
      throw new AccountNotFoundError();
    }

    return this.account.address;
  }

  /**
   * Signs a message using the associated account.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   *
   * const message = await signer.signMessage("hello");
   * ```
   *
   * @param {string | Uint8Array} message the message to be signed
   * @returns {Promise<string>} a promise that resolves to the signed message
   * @throws {AccountNotFoundError} if the account is not found
   */
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

  /**
   * Sends a transaction using the account provider and returns the transaction response.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   *
   * const tx = await signer.sendTransaction({
   *  to: "0x1234567890123456789012345678901234567890",
   *  value: "0x0",
   *  data: "0x",
   * });
   * ```
   *
   * @param {Deferrable<TransactionRequest>} transaction the transaction request to be sent
   * @returns {Promise<TransactionResponse>} a promise that resolves to the transaction response
   * @throws {AccountNotFoundError} if the account is not found in the provider
   */
  async sendTransaction(
    transaction: Deferrable<TransactionRequest>,
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

  /**
   * Throws an error indicating that transaction signing is not supported and advises to use `sendUserOperation` instead.
   *
   * @param {Deferrable<TransactionRequest>} _transaction The transaction request
   * @throws {Error} Will always throw an error indicating transaction signing is unsupported
   */
  signTransaction(
    _transaction: Deferrable<TransactionRequest>,
  ): Promise<string> {
    throw new Error(
      "Transaction signing is not supported, use sendUserOperation instead",
    );
  }

  /**
   * Retrieves the BundlerClient instance from the provider.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   *
   * const bundler = signer.getBundlerClient();
   * ```
   *
   * @returns {BundlerClient<Transport>} The BundlerClient instance
   */
  getBundlerClient(): BundlerClient<Transport> {
    return this.provider.getBundlerClient();
  }

  /**
   * Sets the provider for the account signer and returns the updated account signer instance.
   * Note: this is not necessary since the Provider is required by the constructor. This is useful
   * if you want to change the provider after the account signer has been created.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   * import { http } from "viem";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter();
   * const signer = new AccountSigner(provider, account);
   *
   * signer.connect(provider);
   * ```
   *
   * @param {EthersProviderAdapter} provider the provider to be set for the account signer
   * @returns {AccountSigner<TAccount>} the updated account signer instance
   */
  connect(provider: EthersProviderAdapter): AccountSigner<TAccount> {
    this.provider = provider;

    return this;
  }
}

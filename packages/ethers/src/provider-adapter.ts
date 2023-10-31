import {
  SmartAccountProvider,
  getChain,
  getDefaultEntryPointAddress,
  type AccountMiddlewareFn,
  type FeeDataMiddleware,
  type GasEstimatorMiddleware,
  type HttpTransport,
  type ISmartContractAccount,
  type PaymasterAndDataMiddleware,
  type PublicErc4337Client,
} from "@alchemy/aa-core";
import { defineReadOnly } from "@ethersproject/properties";
import { JsonRpcProvider } from "@ethersproject/providers";
import { AccountSigner } from "./account-signer.js";
import { EthersProviderAdapterOptsSchema } from "./schema.js";
import type { EthersProviderAdapterOpts } from "./types.js";

/** Lightweight Adapter for SmartAccountProvider to enable Signer Creation */
export class EthersProviderAdapter extends JsonRpcProvider {
  readonly accountProvider: SmartAccountProvider<HttpTransport>;

  constructor(opts: EthersProviderAdapterOpts) {
    EthersProviderAdapterOptsSchema.parse(opts);

    super();
    if ("accountProvider" in opts) {
      this.accountProvider = opts.accountProvider;
    } else {
      const chain = getChain(opts.chainId);
      this.accountProvider = new SmartAccountProvider({
        rpcProvider: opts.rpcProvider,
        entryPointAddress:
          opts.entryPointAddress ?? getDefaultEntryPointAddress(chain),
        chain,
      });
    }
  }

  /**
   * Rewrites the send method to use the account provider's EIP-1193
   * compliant request method
   *
   * @param method - the RPC method to call
   * @param params - the params required by the RPC method
   * @returns the result of the RPC call
   */
  send(method: string, params: any[]): Promise<any> {
    return this.accountProvider.request({ method, params });
  }

  /**
   * Connects the Provider to an Account and returns a Signer
   *
   * @param fn - a function that takes the account provider's rpcClient and returns an ISmartContractAccount
   * @returns an {@link AccountSigner} that can be used to sign and send user operations
   */
  connectToAccount<TAccount extends ISmartContractAccount>(
    fn: (rpcClient: PublicErc4337Client) => TAccount
  ): AccountSigner<TAccount> {
    defineReadOnly(
      this,
      "accountProvider",
      this.accountProvider.connect<TAccount>(fn)
    );

    return new AccountSigner(this);
  }

  withPaymasterMiddleware = (overrides: {
    dummyPaymasterDataMiddleware?: PaymasterAndDataMiddleware;
    paymasterDataMiddleware?: PaymasterAndDataMiddleware;
  }): this => {
    this.accountProvider.withPaymasterMiddleware(overrides);
    return this;
  };

  withGasEstimator = (override: GasEstimatorMiddleware): this => {
    this.accountProvider.withGasEstimator(override);
    return this;
  };

  withFeeDataGetter = (override: FeeDataMiddleware): this => {
    this.accountProvider.withFeeDataGetter(override);
    return this;
  };

  withCustomMiddleware = (override: AccountMiddlewareFn): this => {
    this.accountProvider.withCustomMiddleware(override);
    return this;
  };

  getPublicErc4337Client(): PublicErc4337Client {
    return this.accountProvider.rpcClient;
  }

  /**
   * Creates an instance of EthersProviderAdapter from an ethers.js JsonRpcProvider.
   *
   * @param provider - the ethers JSON RPC provider to convert
   * @returns an instance of {@link EthersProviderAdapter}
   */
  static fromEthersProvider(provider: JsonRpcProvider): EthersProviderAdapter {
    return new EthersProviderAdapter({
      rpcProvider: provider.connection.url,
      chainId: provider.network.chainId,
    });
  }
}

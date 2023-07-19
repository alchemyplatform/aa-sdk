import {
  BaseSmartContractAccount,
  SmartAccountProvider,
  getChain,
  type AccountMiddlewareFn,
  type Address,
  type FeeDataMiddleware,
  type GasEstimatorMiddleware,
  type HttpTransport,
  type PaymasterAndDataMiddleware,
  type PublicErc4337Client,
} from "@alchemy/aa-core";
import { defineReadOnly } from "@ethersproject/properties";
import { JsonRpcProvider } from "@ethersproject/providers";
import { AccountSigner } from "./account-signer.js";

/** Lightweight Adapter for SmartAccountProvider to enable Signer Creation */
export class EthersProviderAdapter extends JsonRpcProvider {
  readonly accountProvider: SmartAccountProvider<HttpTransport>;
  constructor(
    rpcProvider: string | PublicErc4337Client<HttpTransport>,
    entryPointAddress: Address,
    chainId: number
  ) {
    super();
    const chain = getChain(chainId);
    this.accountProvider = new SmartAccountProvider(
      rpcProvider,
      entryPointAddress,
      chain
    );
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
   * @param fn - a function that takes the account provider's rpcClient and returns a BaseSmartContractAccount
   * @returns an {@link AccountSigner} that can be used to sign and send user operations
   */
  connectToAccount(
    fn: (rpcClient: PublicErc4337Client) => BaseSmartContractAccount
  ): AccountSigner {
    defineReadOnly(this, "accountProvider", this.accountProvider.connect(fn));
    return this.getAccountSigner();
  }

  /**
   * @returns an {@link AccountSigner} using this as the underlying provider
   */
  getAccountSigner(): AccountSigner {
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
   * @param provider - the ethers JSON RPC provider to convert
   * @param entryPointAddress - the entrypoint address that will be used for UserOperations
   * @returns an instance of {@link EthersProviderAdapter}
   */
  static fromEthersProvider(
    provider: JsonRpcProvider,
    entryPointAddress: Address
  ): EthersProviderAdapter {
    return new EthersProviderAdapter(
      provider.connection.url,
      entryPointAddress,
      provider.network.chainId
    );
  }
}

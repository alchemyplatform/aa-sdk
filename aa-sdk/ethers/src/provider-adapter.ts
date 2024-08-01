import {
  createBundlerClientFromExisting,
  createSmartAccountClient,
  type BundlerClient,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  createPublicClient,
  custom,
  http,
  type Chain,
  type Transport,
} from "viem";
import { AccountSigner } from "./account-signer.js";
import type { EthersProviderAdapterOpts } from "./types.js";

/** Lightweight Adapter for SmtAccountProvider to enable Signer Creation */
export class EthersProviderAdapter extends JsonRpcProvider {
  readonly accountProvider: SmartAccountClient;

  /**
   * Configures and initializes the account provider based on the given options.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter({
   *  account,
   *  chain: sepolia,
   *  rpcProvider: "https://eth-sepolia.g.alchemy.com/v2/your-api-key"
   * });
   * ```
   *
   * @param {EthersProviderAdapterOpts} opts The options for setting up the ethers provider adapter
   */
  constructor(opts: EthersProviderAdapterOpts) {
    super();
    if ("accountProvider" in opts) {
      this.accountProvider = opts.accountProvider;
    } else {
      const { chain } = opts;

      if (typeof opts.rpcProvider === "string") {
        this.accountProvider = createSmartAccountClient({
          transport: http(opts.rpcProvider),
          chain,
          account: opts.account,
        });
      } else {
        this.accountProvider = createSmartAccountClient({
          transport: custom(opts.rpcProvider.transport),
          chain,
          account: opts.account,
        });
      }
    }
  }

  /**
   * Rewrites the send method to use the account provider's EIP-1193
   * compliant request method
   *
   * @param {any} method - the RPC method to call
   * @param {any[]} params - the params required by the RPC method
   * @returns {Promise<any>} the result of the RPC call
   */
  send(method: any, params: any[]): Promise<any> {
    // @ts-expect-error - viem is strongly typed on the request methods, but ethers is not
    return this.accountProvider.request({ method, params });
  }

  /**
   * Connects the Provider to an Account and returns a Signer
   *
   * @param {SmartContractAccount} account - the account to connect to
   * @returns {AccountSigner} an AccountSigner that can be used to sign and send user operations
   */
  connectToAccount<TAccount extends SmartContractAccount>(
    account: TAccount
  ): AccountSigner<TAccount> {
    return new AccountSigner<TAccount>(this, account);
  }

  /**
   * Creates and returns a BundlerClient using the existing account provider's transport and chain.
   *
   * @example
   * ```ts
   * import { AccountSigner, EthersProviderAdapter } from "@aa-sdk/ethers";
   * import { LocalAccountSigner } from "@aa-sdk/core";
   * import { sepolia } from "@account-kit/infra";
   * import { createLightAccount } from "@account-kit/smart-contracts";
   *
   * const account = await createLightAccount({
   *  transport: http("https://rpc.testnet.aepps.com"),
   *  chain: sepolia,
   *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
   * });
   *
   * const provider = new EthersProviderAdapter({
   *  account,
   *  chain: sepolia,
   *  rpcProvider: "https://eth-sepolia.g.alchemy.com/v2/your-api-key"
   * });
   *
   * const bundlerClient = provider.getBundlerClient();
   * ```
   *
   * @returns {BundlerClient<Transport>} A bundler client configured with the existing account provider.
   */
  getBundlerClient(): BundlerClient<Transport> {
    return createBundlerClientFromExisting(
      createPublicClient({
        transport: custom(this.accountProvider.transport),
        chain: this.accountProvider.chain!,
      })
    );
  }

  /**
   * Creates an instance of EthersProviderAdapter from an ethers.js JsonRpcProvider.
   *
   * @param {JsonRpcProvider} provider the ethers JSON RPC provider to convert
   * @param {Chain} chain the chain to connect to
   * @returns {EthersProviderAdapter} an instance of EthersProviderAdapter
   */
  static fromEthersProvider(
    provider: JsonRpcProvider,
    chain: Chain
  ): EthersProviderAdapter {
    return new EthersProviderAdapter({
      rpcProvider: provider.connection.url,
      chain,
    });
  }
}

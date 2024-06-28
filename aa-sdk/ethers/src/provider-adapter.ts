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

/** Lightweight Adapter for SmartAccountProvider to enable Signer Creation */
// TODO: Add support for strong entry point version type
export class EthersProviderAdapter extends JsonRpcProvider {
  readonly accountProvider: SmartAccountClient;

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
   * @param method - the RPC method to call
   * @param params - the params required by the RPC method
   * @returns the result of the RPC call
   */
  send(method: any, params: any[]): Promise<any> {
    // @ts-expect-error - viem is strongly typed on the request methods, but ethers is not
    return this.accountProvider.request({ method, params });
  }

  /**
   * Connects the Provider to an Account and returns a Signer
   *
   * @param account - the account to connect to
   * @returns an {@link AccountSigner} that can be used to sign and send user operations
   */
  connectToAccount<TAccount extends SmartContractAccount>(
    account: TAccount
  ): AccountSigner<TAccount> {
    return new AccountSigner<TAccount>(this, account);
  }

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
   * @param provider the ethers JSON RPC provider to convert
   * @param chain the chain to connect to
   * @returns an instance of {@link EthersProviderAdapter}
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

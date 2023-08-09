import {
  BaseSmartContractAccount,
  SmartAccountProvider,
  deepHexlify,
  resolveProperties,
  type AccountMiddlewareFn,
  type SmartAccountProviderOpts,
} from "@alchemy/aa-core";
import type { Address, Chain, HttpTransport } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
} from "viem/chains";
import { SupportedChains } from "./chains.js";
import {
  withAlchemyGasManager,
  type AlchemyGasManagerConfig,
} from "./middleware/gas-manager.js";
import { withAlchemyGasFeeEstimator } from "./middleware/gas-fees.js";
import type { ClientWithAlchemyMethods } from "./middleware/client.js";

type ConnectionConfig =
  | {
      apiKey: string;
      rpcUrl?: undefined;
    }
  | { rpcUrl: string; apiKey?: undefined };

export type AlchemyProviderConfig = {
  chain: Chain | number;
  entryPointAddress: Address;
  account?: BaseSmartContractAccount;
  opts?: SmartAccountProviderOpts;
  feeOpts?: {
    /** this adds a percent buffer on top of the base fee estimated (default 25%) */
    baseFeeBufferPercent?: bigint;
    /** this adds a percent buffer on top of the priority fee estimated (default 5%) */
    maxPriorityFeeBufferPercent?: bigint;
  };
} & ConnectionConfig;

export class AlchemyProvider extends SmartAccountProvider<HttpTransport> {
  alchemyClient: ClientWithAlchemyMethods;

  constructor({
    chain,
    entryPointAddress,
    account,
    opts,
    feeOpts,
    ...connectionConfig
  }: AlchemyProviderConfig) {
    const _chain =
      typeof chain === "number" ? SupportedChains.get(chain) : chain;
    if (!_chain || !_chain.rpcUrls["alchemy"]) {
      throw new Error(`AlchemyProvider: chain (${chain}) not supported`);
    }

    const rpcUrl =
      connectionConfig.apiKey !== undefined
        ? `${_chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey}`
        : connectionConfig.rpcUrl;

    super(rpcUrl, entryPointAddress, _chain, account, opts);

    this.alchemyClient = this.rpcClient as ClientWithAlchemyMethods;
    withAlchemyGasFeeEstimator(
      this,
      feeOpts?.baseFeeBufferPercent ?? 25n,
      feeOpts?.maxPriorityFeeBufferPercent ?? 5n
    );
  }

  gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.entryPointAddress
    );

    // On Arbitrum and Optimism, we need to increase the preVerificationGas by 10%
    // to ensure the transaction is mined
    if (
      new Set<number>([
        arbitrum.id,
        arbitrumGoerli.id,
        optimism.id,
        optimismGoerli.id,
      ]).has(this.chain.id)
    ) {
      estimates.preVerificationGas =
        (BigInt(estimates.preVerificationGas) * 110n) / 100n;
    }

    return {
      ...struct,
      ...estimates,
    };
  };

  withAlchemyGasManager(config: AlchemyGasManagerConfig) {
    if (!this.isConnected()) {
      throw new Error(
        "AlchemyProvider: account is not set, did you call `connect` first?"
      );
    }

    return withAlchemyGasManager(this, config);
  }
}

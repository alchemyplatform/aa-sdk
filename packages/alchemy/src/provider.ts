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
import { ChainFeeStrategies, SupportedChains } from "./chains.js";
import {
  GasFeeStrategy,
  withAlchemyGasFeeEstimator,
} from "./middleware/gas-fees.js";
import {
  withAlchemyGasManager,
  type AlchemyGasManagerConfig,
} from "./middleware/gas-manager.js";

export type AlchemyProviderConfig = {
  apiKey: string;
  chain: Chain | number;
  entryPointAddress: Address;
  account?: BaseSmartContractAccount;
  opts?: SmartAccountProviderOpts;
};

export class AlchemyProvider extends SmartAccountProvider<HttpTransport> {
  constructor({
    apiKey,
    chain,
    entryPointAddress,
    account,
    opts,
  }: AlchemyProviderConfig) {
    const _chain =
      typeof chain === "number" ? SupportedChains.get(chain) : chain;
    if (!_chain || !_chain.rpcUrls["alchemy"]) {
      throw new Error(`AlchemyProvider: chain (${chain}) not supported`);
    }

    const rpcUrl = `${_chain.rpcUrls.alchemy.http[0]}/${apiKey}`;
    super(rpcUrl, entryPointAddress, _chain, account, opts);

    withAlchemyGasFeeEstimator(
      this,
      ChainFeeStrategies.get(_chain.id) ?? {
        strategy: GasFeeStrategy.DEFAULT,
        value: 0n,
      }
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

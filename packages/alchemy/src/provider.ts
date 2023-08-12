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
  alchemyPaymasterAndDataMiddleware,
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
    /** this adds a percent buffer on top of the base fee estimated (default 50%)
     * NOTE: this is only applied if the default fee estimator is used.
     */
    baseFeeBufferPercent?: bigint;
    /** this adds a percent buffer on top of the priority fee estimated (default 5%)'
     * * NOTE: this is only applied if the default fee estimator is used.
     */
    maxPriorityFeeBufferPercent?: bigint;
    /** this adds a percent buffer on top of the preVerificationGasEstimated
     *
     * Defaults 5% on Arbitrum and Optimism, 0% elsewhere
     *
     * This is only useful on Arbitrum and Optimism, where the preVerificationGas is
     * dependent on the gas fee during the time of estimation. To improve chances of
     * the UserOperation being mined, users can increase the preVerificationGas by
     * a buffer. This buffer will always be charged, regardless of price at time of mine.
     *
     * NOTE: this is only applied if the defualt gas estimator is used.
     */
    preVerificationGasBufferPercent?: bigint;
  };
} & ConnectionConfig;

export class AlchemyProvider extends SmartAccountProvider<HttpTransport> {
  alchemyClient: ClientWithAlchemyMethods;
  private pvgBuffer: bigint;
  private feeOptsSet: boolean;

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
      feeOpts?.baseFeeBufferPercent ?? 50n,
      feeOpts?.maxPriorityFeeBufferPercent ?? 5n
    );

    if (feeOpts?.preVerificationGasBufferPercent) {
      this.pvgBuffer = feeOpts?.preVerificationGasBufferPercent;
    } else if (
      new Set<number>([
        arbitrum.id,
        arbitrumGoerli.id,
        optimism.id,
        optimismGoerli.id,
      ]).has(this.chain.id)
    ) {
      this.pvgBuffer = 5n;
    } else {
      this.pvgBuffer = 0n;
    }

    this.feeOptsSet = !!feeOpts;
  }

  gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.entryPointAddress
    );
    estimates.preVerificationGas =
      (BigInt(estimates.preVerificationGas) * (100n + this.pvgBuffer)) / 100n;

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

    if (this.feeOptsSet) {
      return this.withPaymasterMiddleware(
        alchemyPaymasterAndDataMiddleware(this, config)
      );
    } else {
      return withAlchemyGasManager(this, config);
    }
  }
}

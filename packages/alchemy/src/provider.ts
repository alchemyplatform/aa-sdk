import {
  SmartAccountProvider,
  deepHexlify,
  getUserOperationHash,
  isValidRequest,
  resolveProperties,
  type AccountMiddlewareFn,
  type UserOperationCallData,
} from "@alchemy/aa-core";
import { Alchemy } from "alchemy-sdk";
import { type HttpTransport } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
} from "viem/chains";
import { SupportedChains } from "./chains.js";
import { createAlchemyEnhanced4337Client } from "./client/factory.js";
import type { SimulateExecutionResponse } from "./client/interfaces.js";
import type { AlchemyEnhanced4337Client } from "./client/types.js";
import { withAlchemyGasFeeEstimator } from "./middleware/gas-fees.js";
import {
  withAlchemyGasManager,
  type AlchemyGasManagerConfig,
} from "./middleware/gas-manager.js";
import {
  AlchemyProviderConfigSchema,
  AlchemySdkClientSchema,
} from "./schema.js";
import type { AlchemyProviderConfig } from "./type.js";

export class AlchemyProvider extends SmartAccountProvider<HttpTransport> {
  private pvgBuffer: bigint;
  private feeOptsSet: boolean;
  private rpcUrl: string;
  private client: AlchemyEnhanced4337Client<HttpTransport>;

  constructor(config: AlchemyProviderConfig) {
    AlchemyProviderConfigSchema.parse(config);

    const { chain, entryPointAddress, opts, feeOpts, ...connectionConfig } =
      config;
    const _chain =
      typeof chain === "number" ? SupportedChains.get(chain) : chain;
    if (!_chain || !_chain.rpcUrls["alchemy"]) {
      throw new Error(`AlchemyProvider: chain (${chain}) not supported`);
    }

    const rpcUrl =
      connectionConfig.rpcUrl == null
        ? `${_chain.rpcUrls.alchemy.http[0]}/${connectionConfig.apiKey ?? ""}`
        : connectionConfig.rpcUrl;

    const client = createAlchemyEnhanced4337Client({
      chain: _chain,
      rpcUrl,
      ...(connectionConfig.jwt != null && {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${connectionConfig.jwt}`,
          },
        },
      }),
    });

    super({
      rpcProvider: client,
      entryPointAddress,
      chain: _chain,
      opts,
    });

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
    this.rpcUrl = rpcUrl;
    this.client = client;
  }

  override gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.getEntryPointAddress()
    );
    estimates.preVerificationGas =
      (BigInt(estimates.preVerificationGas) * (100n + this.pvgBuffer)) / 100n;

    return {
      ...struct,
      ...estimates,
    };
  };

  simulateUserOperationExecution = async (
    uoCallData: UserOperationCallData
  ): Promise<SimulateExecutionResponse | SimulateExecutionResponse[]> => {
    const uoStruct = await this.buildUserOperation(uoCallData);

    if (!this.account) {
      throw new Error("account not connected");
    }

    const request = deepHexlify(uoStruct);
    if (!isValidRequest(request)) {
      // this pretty prints the uo
      throw new Error(
        `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
          request,
          null,
          2
        )}`
      );
    }

    request.signature = (await this.account.signMessage(
      getUserOperationHash(
        request,
        this.entryPointAddress as `0x${string}`,
        BigInt(this.chain.id)
      )
    )) as `0x${string}`;

    return this.client.simulateUserOperationExecution(request);
  };

  /**
   * This methods adds the Alchemy Gas Manager middleware to the provider.
   *
   * @param config - the Alchemy Gas Manager configuration
   * @returns {AlchemyProvider} - a new AlchemyProvider with the Gas Manager middleware
   */
  withAlchemyGasManager(config: AlchemyGasManagerConfig): AlchemyProvider {
    if (!this.isConnected()) {
      throw new Error(
        "AlchemyProvider: account is not set, did you call `connect` first?"
      );
    }

    return withAlchemyGasManager(this, config, !this.feeOptsSet);
  }

  /**
   * This methods adds Alchemy Enhanced APIs to the provider, via a peer dependency on `alchemy-sdk`.
   * @see: https://github.com/alchemyplatform/alchemy-sdk-js
   *
   * The Alchemy SDK client must be configured with the same API key and network as the AlchemyProvider.
   * This method validates such at runtime.
   *
   * Additionally, since the Alchemy SDK client does not yet support JWT authentication, AlchemyProviders initialized with JWTs cannot use this method.
   * They must be initialized with an API key or RPC URL.
   * There is an open issue on the Alchemy SDK repo to add JWT support in the meantime.
   * @see: https://github.com/alchemyplatform/alchemy-sdk-js/issues/386
   *
   * @param alchemy - an initialized Alchemy SDK client
   * @returns - a new AlchemyProvider extended with Alchemy SDK client methods
   */
  withAlchemyEnhancedApis(alchemy: Alchemy): this & Alchemy {
    AlchemySdkClientSchema.parse(alchemy);

    if (alchemy.config.url && alchemy.config.url !== this.rpcUrl) {
      throw new Error(
        "Alchemy SDK client JSON-RPC URL must match AlchemyProvider JSON-RPC URL"
      );
    }

    const alchemyUrl = `https://${alchemy.config.network}.g.alchemy.com/v2/${alchemy.config.apiKey}`;
    if (alchemyUrl !== this.rpcUrl) {
      throw new Error(
        "Alchemy SDK client JSON-RPC URL must match AlchemyProvider JSON-RPC URL"
      );
    }

    return this.extend(() => {
      return {
        core: alchemy.core,
        nft: alchemy.nft,
        transact: alchemy.transact,
        debug: alchemy.debug,
        ws: alchemy.ws,
        notify: alchemy.notify,
        config: alchemy.config,
      };
    });
  }
}

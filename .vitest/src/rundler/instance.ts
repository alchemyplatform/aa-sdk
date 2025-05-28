import getPort from "get-port";

import { defineInstance } from "prool";
import { execa } from "prool/processes";
import { toArgs } from "./toArgs";

export type RundlerParameters = {
  /**
   * The path to the rundler binary
   *
   * @default rundler
   */
  binary?: string;

  /**
   * Network to look up a hardcoded chain spec.
   * @default dev
   */
  network?: string;

  /**
   * Path to a chain spec TOML file.
   */
  chainSpec?: string;

  /**
   * Allows overriding the chain id for a given chain spec
   *
   * @default unset
   */
  chainId?: number | undefined;

  /**
   * EVM Node HTTP URL to use.
   *
   * @default http://localhost:8545
   */
  nodeHttp?: string;

  /**
   * Maximum verification gas.
   * @default 5000000
   */
  maxVerificationGas?: number;

  /**
   * Maximum bundle gas.
   * @default 25000000
   */
  maxBundleGas?: number;

  /**
   * Minimum stake value.
   * @default 1000000000000000000
   */
  minStakeValue?: number;

  /**
   * Minimum unstake delay.
   * @default 84600
   */
  minUnstakeDelay?: number;

  /**
   * Number of blocks to search when calling eth_getUserOperationByHash.
   * @default 100
   */
  userOperationEventBlockDistance?: number;

  /**
   * Maximum gas for simulating handle operations.
   * @default 20000000
   */
  maxSimulateHandleOpsGas?: number;

  /**
   * The gas fee to use during verification estimation.
   * @default 1000000000000 10K gwei
   */
  verificationEstimationGasFee?: number;

  /**
   * Bundle transaction priority fee overhead over network value.
   * @default 0
   */
  bundlePriorityFeeOverheadPercent?: number;

  /**
   * Priority fee mode kind.
   * Possible values are base_fee_percent and priority_fee_increase_percent.
   * @default priority_fee_increase_percent
   */
  priorityFeeModeKind?:
    | "base_fee_percent"
    | "priority_fee_increase_percent"
    | undefined;

  /**
   * Priority fee mode value.
   * @default 0
   */
  priorityFeeModeValue?: number;

  /**
   * Percentage of the current network fees a user operation must have in order to be accepted into the mempool.
   * @default 100
   */
  baseFeeAcceptPercent?: number;

  /**
   * AWS region.
   * @default us-east-1
   */
  awsRegion?: string;

  /**
   * Interval at which the builder polls an RPC node for new blocks and mined transactions.
   * @default 100
   */
  ethPollIntervalMillis?: number;

  /**
   * Flag for unsafe bundling mode. When set Rundler will skip checking simulation rules (and any debug_traceCall).
   *
   * @default true
   */
  unsafe?: boolean;

  /**
   * Path to the mempool configuration file.
   * This path can either be a local file path or an S3 url.
   */
  mempoolConfigPath?: string;

  /**
   * Disables entry point version v0.6.
   * @default false
   */
  disableEntryPointV0_6?: boolean;

  /**
   * The number of builder accounts to use for entry point version v0.6.
   *
   * @default 1
   */
  numBuildersV0_6?: number;

  /**
   * Disables entry point version v0.7.
   * @default false
   */
  disableEntryPointV0_7?: boolean;

  /**
   * The number of builder accounts to use for entry point version v0.7.
   * @default 1
   */
  numBuildersV0_7?: number;

  metrics?: {
    /**
     * Port to listen on for metrics requests.
     * @default 8080
     */
    port?: number;

    /**
     * Host to listen on for metrics requests.
     * @default 0.0.0.0
     */
    host?: string;

    /**
     * Tags for metrics in the format key1=value1,key2=value2,...
     */
    tags?: string;

    /**
     * Sample interval to use for sampling metrics.
     * @default 1000
     */
    sampleIntervalMillis?: number;
  };

  logging?: {
    /**
     * Log file. If not provided, logs will be written to stdout.
     */
    file?: string;

    /**
     * If set, logs will be written in JSON format.
     */
    json?: boolean;
  };

  rpc?: {
    /**
     * Port to listen on for JSON-RPC requests.
     * @default 3000
     */
    port?: number;

    /**
     * Host to listen on for JSON-RPC requests.
     * @default 127.0.0.1
     */
    host?: string;

    /**
     * Which APIs to expose over the RPC interface.
     * @default eth,rundler
     */
    api?: string;

    /**
     * Timeout for RPC requests.
     * @default 20
     */
    timeoutSeconds?: number;

    /**
     * Maximum number of concurrent connections.
     * @default 100
     */
    maxConnections?: number;
  };

  pool?: {
    /**
     * Maximum size in bytes for the pool.
     * @default 500000000, 0.5 GB
     */
    maxSizeInBytes?: number;

    /**
     * Maximum number of user operations for an unstaked sender.
     * @default 4
     */
    sameSenderMempoolCount?: number;

    /**
     * Minimum replacement fee increase percentage.
     * @default 10
     */
    minReplacementFeeIncreasePercentage?: number;

    /**
     * Path to a blocklist file.
     * This path can either be a local file path or an S3 url.
     */
    blocklistPath?: string;

    /**
     * Path to an allowlist file.
     * This path can either be a local file path or an S3 url.
     */
    allowlistPath?: string;

    /**
     * Size of the chain history.
     */
    chainHistorySize?: number;

    /**
     * Boolean field that sets whether the pool server starts with paymaster tracking enabled.
     * @default true
     */
    paymasterTrackingEnabled?: boolean;

    /**
     * Length of the paymaster cache.
     * @default 10_000
     */
    paymasterCacheLength?: number;

    /**
     * Boolean field that sets whether the pool server starts with reputation tracking enabled.
     * @default true
     */
    reputationTrackingEnabled?: boolean;

    /**
     * The minimum number of blocks that a UO must stay in the mempool before it can be requested to be dropped by the user.
     * @default 10
     */
    dropMinNumBlocks?: number;
  };

  signer?: {
    /**
     * Private keys to use for signing transactions.
     * If used with awsKmsKeyIds, then explicitly pass in `null` here.
     *
     * @default ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80','0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d']
     */
    privateKeys?: string[];
  };

  builder?: {
    /**
     * AWS KMS key IDs to use for signing transactions.
     * Only required if privateKeys is not provided.
     *
     * @default null
     */
    awsKmsKeyIds?: string[];

    /**
     * Redis URI to use for KMS leasing.
     * Only required when awsKmsKeyIds are provided.
     *
     * @default ""
     */
    redisUri?: string;

    /**
     * Redis lock TTL in milliseconds.
     * Only required when awsKmsKeyIds are provided.
     * @default 60000
     */
    redisLockTtlMillis?: number;

    /**
     * Maximum number of ops to include in one bundle.
     * @default 128
     */
    maxBundleSize?: number;

    /**
     * If present, the URL of the ETH provider that will be used to send transactions.
     * Defaults to the value of nodeHttp.
     */
    submitUrl?: string;

    /**
     * Choice of what sender type to use for transaction submission.
     * @default raw
     * options: raw, flashbots, polygon_bloxroute
     */
    sender?: "raw" | "flashbots" | "polygonBloxroute" | undefined;

    /**
     * Use the submit URL for transaction status checks.
     * @default false
     */
    useSubmitForStatus?: boolean | undefined;

    /**
     * If the sender supports the 'dropped' status. Many senders do not support this status, and only support 'pending' or 'mined'.
     * @default false
     */
    droppedStatusUnsupported?: boolean | undefined;

    /**
     * After submitting a bundle transaction, the maximum number of blocks to wait for that transaction to mine before trying to resend with higher gas fees.
     * @default 2
     */
    maxBlocksToWaitForMine?: number;

    /**
     * Percentage amount to increase gas fees when retrying a transaction after it failed to mine.
     * @default 10
     */
    replacementFeePercentIncrease?: number;

    /**
     * Maximum number of fee increases to attempt during a cancellation.
     * @default 15
     */
    maxCancellationFeeIncreases?: number | undefined;

    /**
     * The maximum number of blocks to spend in a replacement underpriced state before issuing a transaction cancellation.
     * @default 20
     */
    maxReplacementUnderpricedBlocks?: number | undefined;

    /**
     * Additional builders to send bundles to through the Flashbots relay RPC (comma-separated).
     * List of builders that the Flashbots RPC supports can be found here.
     * @default flashbots
     */
    flashbotsRelayBuilders?: string;

    /**
     * Authorization key to use with the Flashbots relay.
     * See here for more info.
     * @default None
     */
    flashbotsRelayAuthKey?: string;

    /**
     * If using the bloxroute transaction sender on Polygon, this is the auth header to supply with the requests.
     * @default None
     */
    bloxrouteAuthHeader?: string;

    /**
     * If running multiple builder processes, this is the index offset to assign unique indexes to each bundle sender.
     * @default 0
     */
    indexOffset?: number;
  };

  /**
   * Log level for the Rundler binary.
   *
   * @default "debug"
   */
  logLevel?: "error" | "warn" | "info" | "debug" | "trace" | "off" | undefined;
};

/**
 * Defines a Rundler instance.
 *
 * @example
 * ```ts
 * const instance = rundler({
 *  nodeHttp: 'http://localhost:8545',
 * });
 *
 * await instance.start()
 * // ...
 * await instance.stop()
 * ```
 */
export const rundler = defineInstance((parameters?: RundlerParameters) => {
  const {
    binary = "rundler",
    logLevel = "debug",
    chainId,
    ...args
  } = (parameters ?? {}) as RundlerParameters;

  const host = "127.0.0.1";
  const name = "rundler";
  const process = execa({ name });

  return {
    _internal: {
      args,
      get process() {
        return process._internal.process;
      },
    },
    host,
    port: args.rpc?.port ?? 3000,
    name,
    async start({ port = args.rpc?.port ?? 3000 }, options) {
      const args_ = {
        ...args,
        builder: {
          ...args.builder,
        },
        signer: {
          privateKeys: args.signer?.privateKeys ?? [
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
          ],
        },
        maxVerificationGas: args.maxVerificationGas ?? 10000000,
        network: args.network ?? "dev",
        nodeHttp: args.nodeHttp ?? "http://localhost:8545",
        metrics: {
          ...args.metrics,
          port: await getPort(),
        },
        rpc: {
          ...args.rpc,
          port,
        },
        unsafe: args.unsafe ?? true,
        userOperationEventBlockDistance:
          args.userOperationEventBlockDistance ?? 100,
      } satisfies RundlerParameters;

      return await process.start(
        ($) =>
          $(binary, ["node", ...toArgs(args_, { casing: "snake" })], {
            env: {
              RUST_LOG: logLevel,
              // CHAIN_* overrides for a chain spec can only be set via env vars
              ...(chainId != null ? { CHAIN_ID: chainId.toString() } : {}),
            },
          }),
        {
          ...options,
          resolver({ process, reject, resolve }) {
            process.stdout.on("data", (data) => {
              const message = data.toString();
              if (message.includes("Started RPC server")) {
                console.log("Started RPC server");
                resolve();
              }
            });
            process.stderr.on("data", (data) => {
              console.log(data.toString());
              reject(data.toString());
            });
          },
        },
      );
    },
    async stop() {
      await process.stop();
    },
  };
});

import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createSMA7702Account,
  type CreateSMA7702AccountParams,
} from "../account/semiModularAccount7702.js";

import { default7702UserOpSigner, default7702GasEstimator } from "@aa-sdk/core";

import type { MAV2Account } from "../account/common/modularAccountV2Base.js";

export type SMA7702AccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartAccountClient<Transport, Chain, MAV2Account<TSigner>>;

export type CreateSMA7702AccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSMA7702AccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createSMA7702AccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSMA7702AccountClientParams<Transport, TChain, TSigner>
): Promise<SMA7702AccountClient<TSigner>>;

/**
 * Creates a SMAv2 account client using the provided configuration parameters.
 *
 * @example
 * ```ts
 * import { http } from "viem";
 * import { createSMAV2AccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "@account-kit/infra";
 *
 * const MNEMONIC = "...";
 * const RPC_URL = "...";
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const chain = sepolia;
 *
 * const transport = http(RPC_URL);
 *
 * const SMAV2SignerAccountClient = await createSMAV2AccountClient({
 *  chain,
 *  signer,
 *  transport,
 * });
 * ```
 *
 * @param {CreateSMAV2AccountClientParams} config The configuration parameters required to create the MAv2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createSMA7702AccountClient(
  config: CreateSMA7702AccountClientParams
): Promise<SmartAccountClient> {
  const smaV2Account = await createSMA7702Account(config);

  return createSmartAccountClient({
    account: smaV2Account,
    gasEstimator: default7702GasEstimator,
    signUserOperation: default7702UserOpSigner,
    ...config,
  });
}

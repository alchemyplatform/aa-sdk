import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createSMAV2Account,
  type CreateSMAV2AccountParams,
} from "../account/semiModularAccountV2.js";

import type { MAV2Account } from "../account/common/modularAccountV2Base.js";

export type SMAV2AccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartAccountClient<Transport, Chain, MAV2Account<TSigner>>;

export type CreateSMAV2AccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSMAV2AccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createSMAV2AccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSMAV2AccountClientParams<Transport, TChain, TSigner>
): Promise<SMAV2AccountClient<TSigner>>;

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
export async function createSMAV2AccountClient(
  config: CreateSMAV2AccountClientParams
): Promise<SmartAccountClient> {
  const smaV2Account = await createSMAV2Account(config);

  return createSmartAccountClient({
    ...config,
    account: smaV2Account,
  });
}

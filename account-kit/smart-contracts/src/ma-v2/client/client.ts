import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";

import type { SmartAccountClientConfig } from "@aa-sdk/core";

import {
  createSMAV2Account,
  type CreateSMAV2AccountParams,
  type SMAV2Account,
} from "../account/account.js";

export type CreateSMAV2AccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSMAV2AccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createSMAV2SignerAccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSMAV2AccountClientParams<Transport, TChain, TSigner>
): Promise<SmartAccountClient<CustomTransport, Chain, SMAV2Account<TSigner>>>;

/**
 * Creates a MAv2 account client using the provided configuration parameters.
 *
 * @example
 * ```ts
 * import { http } from "viem";
 * import { createSMAV2SignerAccountClient } from "@account-kit/smart-contracts";
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
 * const SMAV2SignerAccountClient = await createSMAV2SignerAccountClient({di
 *  chain,
 *  signer,
 *  transport,
 * });
 * ```
 *
 * @param {CreateSMAV2AccountClientParams} config The configuration parameters required to create the MAv2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createSMAV2SignerAccountClient({
  ...config
}: CreateSMAV2AccountClientParams): Promise<SmartAccountClient> {
  const maV2SignerAccount = await createSMAV2Account({
    ...config,
  });

  return createSmartAccountClient({
    ...config,
    account: maV2SignerAccount,
  });
}

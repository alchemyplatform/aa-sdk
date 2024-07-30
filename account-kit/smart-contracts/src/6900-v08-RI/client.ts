import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";

import type { SmartAccountClientConfig } from "@aa-sdk/core";

import {
  createSingleSignerRIAccount,
  type CreateSingleSignerRIAccountParams,
  type SingleSignerRIAccount,
} from "./account.js";

export type CreateSingleSignerRIAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSingleSignerRIAccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createSingleSignerRIAccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSingleSignerRIAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<CustomTransport, Chain, SingleSignerRIAccount<TSigner>>
>;

/**
 * Creates a single signer RI account client using the provided configuration parameters.
 *
 * @example
 * ```ts
 * import { http } from "viem";
 * import { createSingleSignerRIAccountClient } from "@account-kit/smart-contracts";
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
 * const singleSignerRIAccountClient = await createSingleSignerRIAccountClient({
 *  chain,
 *  signer,
 *  transport,
 * });
 * ```
 *
 * @param {CreateSingleSignerRIAccountClientParams} config The configuration parameters required to create the single signer RI account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createSingleSignerRIAccountClient({
  ...config
}: CreateSingleSignerRIAccountClientParams): Promise<SmartAccountClient> {
  const singleSignerRIAccount = await createSingleSignerRIAccount({
    ...config,
  });

  return createSmartAccountClient({
    ...config,
    account: singleSignerRIAccount,
  });
}

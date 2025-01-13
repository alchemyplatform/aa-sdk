import {
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
  type NotType,
  createSmartAccountClient,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createSMAV2Account,
  type CreateSMAV2AccountParams,
  type MAV2Account,
} from "../account/semiModularAccountV2.js";
import {
  createAlchemySmartAccountClient,
  isAlchemyTransport,
  type AlchemySmartAccountClientConfig,
  type AlchemyTransport,
} from "@account-kit/infra";
import type { LightAccount } from "../../light-account/accounts/account.js";
export type SMAV2AccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TChain extends Chain = Chain,
  TTransport extends Transport | AlchemyTransport = Transport
> = SmartAccountClient<TTransport, TChain, MAV2Account<TSigner>>;

export type CreateSMAV2AccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSMAV2AccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;
export type CreateSMAV2AlchemyAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateSMAV2AccountClientParams<TTransport, TChain, TSigner>,
  "transport"
> &
  Omit<
    AlchemySmartAccountClientConfig<TChain, LightAccount<TSigner>>,
    "account"
  > & { paymasterAndData?: never; dummyPaymasterAndData?: never };

export function createSMAV2AccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSMAV2AlchemyAccountClientParams<AlchemyTransport, TChain, TSigner>
): Promise<SMAV2AccountClient<TSigner, TChain, AlchemyTransport>>;

export function createSMAV2AccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateSMAV2AccountClientParams<TTransport, TChain, TSigner> &
    NotType<TTransport, AlchemyTransport>
): Promise<SMAV2AccountClient<TSigner, TChain>>;

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
 * const policyId = "...";
 *
 * const SMAV2SignerAccountClient = await createSMAV2AccountClient({
 *  chain,
 *  signer,
 *  transport,
 *  policyId, // NOTE: you may only pass in a gas policy ID if you provide an Alchemy transport!
 * });
 * ```
 *
 * @param {CreateSMAV2AccountClientParams} config The configuration parameters required to create the MAv2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createSMAV2AccountClient(
  config: CreateSMAV2AccountClientParams
): Promise<SmartAccountClient> {
  const { transport, chain } = config;
  const smaV2Account = await createSMAV2Account({
    ...config,
    transport,
    chain,
  });
  if (isAlchemyTransport(transport, chain)) {
    return createAlchemySmartAccountClient({
      ...config,
      transport,
      chain,
      account: smaV2Account,
    });
  }

  return createSmartAccountClient({
    ...config,
    account: smaV2Account,
  });
}

import {
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
  type NotType,
  createSmartAccountClient,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createModularAccountV2,
  type CreateModularAccountV2Params,
} from "../account/modularAccountV2.js";

import {
  createAlchemySmartAccountClient,
  isAlchemyTransport,
  type AlchemySmartAccountClientConfig,
  type AlchemyTransport,
} from "@account-kit/infra";
import type { LightAccount } from "../../light-account/accounts/account.js";

import type { MAV2Account } from "../account/common/modularAccountV2Base.js";

export type MAV2AccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TChain extends Chain = Chain,
  TTransport extends Transport | AlchemyTransport = Transport
> = SmartAccountClient<TTransport, TChain, MAV2Account<TSigner>>;

export type CreateModularAccountV2ClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateModularAccountV2Params<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export type CreateModularAccountV2AlchemyClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateModularAccountV2ClientParams<TTransport, TChain, TSigner>,
  "transport"
> &
  Omit<
    AlchemySmartAccountClientConfig<TChain, LightAccount<TSigner>>,
    "account"
  > & { paymasterAndData?: never; dummyPaymasterAndData?: never };

export function createModularAccountV2Client<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateModularAccountV2AlchemyClientParams<
    AlchemyTransport,
    TChain,
    TSigner
  >
): Promise<MAV2AccountClient<TSigner, TChain, AlchemyTransport>>;

export function createModularAccountV2Client<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateModularAccountV2ClientParams<TTransport, TChain, TSigner> &
    NotType<TTransport, AlchemyTransport>
): Promise<MAV2AccountClient<TSigner, TChain>>;

/**
 * Creates a modular account v2 account client using the provided configuration parameters.
 *
 * @example
 * ```ts
 * import { http } from "viem";
 * import { createModularAccountV2Client } from "@account-kit/smart-contracts/experimental";
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
 * const modularAccountV2Client = await createModularAccountV2Client({
 *  chain,
 *  signer,
 *  transport,
 *  policyId, // NOTE: you may only pass in a gas policy ID if you provide an Alchemy transport!
 * });
 * ```
 *
 * @param {CreateModularAccountV2ClientParams} config The configuration parameters required to create the MAv2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createModularAccountV2Client(
  config: CreateModularAccountV2ClientParams
): Promise<SmartAccountClient> {
  const { transport, chain } = config;
  const account = await createModularAccountV2(config);

  if (isAlchemyTransport(transport, chain)) {
    return createAlchemySmartAccountClient({
      ...config,
      transport,
      chain,
      account,
    });
  }

  return createSmartAccountClient({
    ...config,
    account,
  });
}

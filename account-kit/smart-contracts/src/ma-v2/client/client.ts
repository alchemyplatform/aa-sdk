import {
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
  type NotType,
  type OptionalFields,
  createSmartAccountClient,
  default7702GasEstimator,
  default7702UserOpSigner,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createModularAccountV2,
  type CreateModularAccountV2Params,
} from "../account/modularAccountV2.js";

import {
  createAlchemySmartAccountClient,
  isAlchemyTransport,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
  type AlchemyTransport,
} from "@account-kit/infra";
import type { LightAccount } from "../../light-account/accounts/account.js";

import type { ModularAccountV2 } from "../account/common/modularAccountV2Base.js";

export type ModularAccountV2Client<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TChain extends Chain = Chain,
  TTransport extends Transport | AlchemyTransport = Transport
> = SmartAccountClient<TTransport, TChain, ModularAccountV2<TSigner>>;

export type CreateModularAccountV2ClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = OptionalFields<CreateModularAccountV2Params<TTransport, TSigner>, "type"> &
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
): Promise<ModularAccountV2Client<TSigner, TChain, AlchemyTransport>>;

export function createModularAccountV2Client<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateModularAccountV2ClientParams<TTransport, TChain, TSigner> &
    NotType<TTransport, AlchemyTransport>
): Promise<ModularAccountV2Client<TSigner, TChain>>;

/**
 * Creates a Modular Account V2 client using the provided configuration parameters.
 *
 * @example
 * ```ts twoslash
 * import { createModularAccountV2Client } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { alchemy, sepolia } from "@account-kit/infra";
 *
 * const MNEMONIC = "...";
 * const RPC_URL = "...";
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const chain = sepolia;
 *
 * const transport = alchemy({ rpcUrl: RPC_URL });
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
 * @param {CreateModularAccountV2ClientParams} config The configuration parameters required to create the Modular Account v2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createModularAccountV2Client(
  config:
    | CreateModularAccountV2ClientParams
    | CreateModularAccountV2AlchemyClientParams
): Promise<SmartAccountClient | AlchemySmartAccountClient> {
  const config_ = {
    type: config.type ?? "default",
    ...config,
  };

  const { transport, chain } = config_;

  const account = await createModularAccountV2(config_);

  const middlewareToAppend =
    config.type === "7702"
      ? {
          gasEstimator: default7702GasEstimator(config.gasEstimator),
          signUserOperation: default7702UserOpSigner(config.signUserOperation),
        }
      : {};

  if (isAlchemyTransport(transport, chain)) {
    return createAlchemySmartAccountClient({
      ...config_,
      transport,
      chain,
      account,
      ...middlewareToAppend,
    });
  }

  return createSmartAccountClient({
    ...config_,
    account,
    ...middlewareToAppend,
  });
}

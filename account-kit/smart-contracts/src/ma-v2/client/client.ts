import {
  createSmartAccountClient,
  default7702GasEstimator,
  default7702UserOpSigner,
  webauthnGasEstimator,
  type SmartAccountClient,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { type Chain, type Transport } from "viem";

import {
  createModularAccountV2,
  type CreateModularAccountV2Params,
  type CreateWebauthnModularAccountV2Params,
} from "../account/modularAccountV2.js";

import {
  createAlchemySmartAccountClient,
  isAlchemyTransport,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
  type AlchemyTransport,
} from "@account-kit/infra";
import type { LightAccount } from "../../light-account/accounts/account.js";

import type { ToWebAuthnAccountParameters } from "viem/account-abstraction";
import type {
  ModularAccountV2,
  WebauthnModularAccountV2,
} from "../account/common/modularAccountV2Base.js";

export type ModularAccountV2Client<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TChain extends Chain = Chain,
  TTransport extends Transport | AlchemyTransport = Transport,
> = TTransport extends AlchemyTransport
  ? AlchemySmartAccountClient<TChain, ModularAccountV2<TSigner>>
  : SmartAccountClient<TTransport, TChain, ModularAccountV2<TSigner>>;

export type WebauthnModularAccountV2Client<
  TChain extends Chain = Chain,
  TTransport extends Transport | AlchemyTransport = Transport,
> = TTransport extends AlchemyTransport
  ? AlchemySmartAccountClient<TChain, WebauthnModularAccountV2>
  : SmartAccountClient<TTransport, TChain, WebauthnModularAccountV2>;

export type CreateModularAccountV2ClientParams<
  TTransport extends Transport | AlchemyTransport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = CreateModularAccountV2Params<TTransport, TSigner> &
  Omit<
    TTransport extends AlchemyTransport
      ? AlchemySmartAccountClientConfig<TChain>
      : SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export type CreateWebauthnModularAccountV2ClientParams<
  TTransport extends Transport | AlchemyTransport = Transport,
  TChain extends Chain = Chain,
> = CreateWebauthnModularAccountV2Params<TTransport> &
  Omit<
    TTransport extends AlchemyTransport
      ? AlchemySmartAccountClientConfig<TChain>
      : SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  > & {
    credential: ToWebAuthnAccountParameters["credential"];
    getFn?: ToWebAuthnAccountParameters["getFn"];
    rpId?: ToWebAuthnAccountParameters["rpId"];
  };

export type CreateModularAccountV2AlchemyClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = Omit<
  CreateModularAccountV2ClientParams<TTransport, TChain, TSigner>,
  "transport"
> &
  Omit<
    AlchemySmartAccountClientConfig<TChain, LightAccount<TSigner>>, // TO DO: split this type so that it doesn't require a signer
    "account"
  > & { paymasterAndData?: never; dummyPaymasterAndData?: never };

export function createModularAccountV2Client<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  args: CreateModularAccountV2AlchemyClientParams<
    AlchemyTransport,
    TChain,
    TSigner
  >,
): Promise<ModularAccountV2Client<TSigner, TChain, AlchemyTransport>>;

export function createModularAccountV2Client<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  args: CreateModularAccountV2ClientParams<TTransport, TChain, TSigner>,
): Promise<ModularAccountV2Client<TSigner, TChain, TTransport>>;

export function createModularAccountV2Client<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
>(
  args: CreateWebauthnModularAccountV2ClientParams<TTransport, TChain>,
): Promise<WebauthnModularAccountV2Client<TChain, TTransport>>;
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
    | CreateWebauthnModularAccountV2ClientParams
    | CreateModularAccountV2AlchemyClientParams,
): Promise<SmartAccountClient | AlchemySmartAccountClient> {
  const { transport, chain } = config;

  let account;

  if (config.mode === "webauthn") {
    account = await createModularAccountV2(
      config as CreateWebauthnModularAccountV2Params<Transport>,
    );
  } else {
    account = await createModularAccountV2(
      config as CreateModularAccountV2Params,
    );
  }

  const middlewareToAppend = await (async () => {
    switch (config.mode) {
      case "7702":
        return {
          gasEstimator: default7702GasEstimator(config.gasEstimator),
          signUserOperation: default7702UserOpSigner(config.signUserOperation),
        };
      case "webauthn":
        return {
          gasEstimator: webauthnGasEstimator(config.gasEstimator),
        };
      case "default":
      default:
        return {};
    }
  })();

  if (isAlchemyTransport(transport, chain)) {
    return createAlchemySmartAccountClient({
      ...config,
      transport,
      chain,
      account,
      ...middlewareToAppend,
    });
  }

  return createSmartAccountClient({
    ...config,
    account,
    ...middlewareToAppend,
  });
}

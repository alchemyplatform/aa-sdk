import {
  createSmartAccountClient,
  type NotType,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import {
  multiOwnerLightAccountClientActions,
  createMultiOwnerLightAccount,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
  type MultiOwnerLightAccountClientActions,
  type AlchemyMultiOwnerLightAccountClientConfig,
} from "@account-kit/smart-contracts";
import {
  isAlchemyTransport,
  createAlchemySmartAccountClient,
  type AlchemySmartAccountClient,
  type AlchemyTransport,
} from "@account-kit/infra";

export type CreateMultiOwnerLightAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateMultiOwnerLightAccountParams<
    TTransport,
    TSigner
  >["transport"];
  chain: CreateMultiOwnerLightAccountParams<TTransport, TSigner>["chain"];
} & Omit<
  CreateMultiOwnerLightAccountParams<TTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export type CreateMultiOwnerLightAccountClientDynamicTransportParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> =
  | (AlchemyMultiOwnerLightAccountClientConfig<TSigner> & {
      transport: AlchemyTransport;
    })
  | CreateMultiOwnerLightAccountClientParams<TTransport, TChain, TSigner>;

export async function createMultiOwnerLightAccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultiOwnerLightAccountClientConfig<TSigner> & {
    transport: AlchemyTransport;
  }
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultiOwnerLightAccount<TSigner>,
    MultiOwnerLightAccountClientActions<TSigner>
  >
>;

export function createMultiOwnerLightAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerLightAccountClientParams<TTransport, TChain, TSigner> &
    NotType<TTransport, AlchemyTransport>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    MultiOwnerLightAccount<TSigner>,
    SmartAccountClientActions<Chain, SmartContractAccount> &
      MultiOwnerLightAccountClientActions<
        TSigner,
        MultiOwnerLightAccount<TSigner>
      >
  >
>;

/**
 * Creates a multi-owner light account client using the provided parameters. It first creates a multi-owner light account and then creates a smart account client with the provided configurations.
 *
 * @example
 * ```ts
 * import { createMultiOwnerLightAccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createMultiOwnerLightAccountClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @example
 * ```ts
 * import { createMultiOwnerLightAccountClient } from "@account-kit/smart-contracts";
 * import { sepolia, alchemy } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const lightAccountClient = await createMultiOwnerLightAccountClient({
 *  transport: alchemy({
 *    apiKey: "your-api-key",
 *  }),
 *  chain: sepolia
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateMultiOwnerLightAccountClientDynamicTransportParams} params the configuration for creating the multi-owner light / alchemy account client with the provided parameters transport
 * @returns {Promise<SmartAccountClient>} a promise that resolves to a `SmartAccountClient` containing the created account client and relevant methods
 */
export async function createMultiOwnerLightAccountClient(
  params: CreateMultiOwnerLightAccountClientDynamicTransportParams
): Promise<SmartAccountClient | AlchemySmartAccountClient> {
  const { transport, chain } = params;

  const lightAccount = await createMultiOwnerLightAccount({
    ...params,
    transport,
    chain,
  });
  if (isAlchemyTransport(transport, chain)) {
    return createAlchemySmartAccountClient({
      ...params,
      transport,
      chain,
      account: lightAccount,
    }).extend(multiOwnerLightAccountClientActions);
  }

  return createSmartAccountClient({
    ...params,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(multiOwnerLightAccountClientActions);
}

import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import {
  createMultiOwnerLightAccount,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
} from "../accounts/multiOwner.js";
import {
  multiOwnerLightAccountClientActions,
  type MultiOwnerLightAccountClientActions,
} from "../decorators/multiOwnerLightAccount.js";

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

export function createMultiOwnerLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateMultiOwnerLightAccountClientParams<Transport, TChain, TSigner>
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
 * @param {CreateMultiOwnerLightAccountClientParams} params the configuration for creating the multi-owner light account client
 * @returns {Promise<SmartAccountClient>} a promise that resolves to a `SmartAccountClient` containing the created account client and relevant methods
 */
export async function createMultiOwnerLightAccountClient(
  params: CreateMultiOwnerLightAccountClientParams
): Promise<SmartAccountClient> {
  const { transport, chain } = params;

  const lightAccount = await createMultiOwnerLightAccount({
    ...params,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...params,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(multiOwnerLightAccountClientActions);
}

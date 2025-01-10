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
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "../accounts/account.js";
import {
  lightAccountClientActions,
  type LightAccountClientActions,
} from "../decorators/lightAccount.js";
import {
  type AlchemySmartAccountClient,
  type AlchemyTransport,
} from "@account-kit/infra";
import {
  createLightAccountAlchemyClient,
  type AlchemyLightAccountClientConfig,
} from "./alchemyClient.js";

export type CreateLightAccountClientParams<
  TTransport extends Transport | AlchemyTransport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateLightAccountParams<TTransport, TSigner>["transport"];
  chain: CreateLightAccountParams<TTransport, TSigner>["chain"];
} & Omit<CreateLightAccountParams<TTransport, TSigner>, "transport" | "chain"> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export function createLightAccountClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TSigner> & {
    transport: AlchemyTransport;
  }
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    LightAccount<TSigner>,
    LightAccountClientActions<TSigner>
  >
>;
export function createLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TTransport extends Transport = Transport
>(
  args: CreateLightAccountClientParams<TTransport, TChain, TSigner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    TChain,
    LightAccount<TSigner>,
    SmartAccountClientActions<Chain, SmartContractAccount> &
      LightAccountClientActions<TSigner, LightAccount<TSigner>>
  >
>;

/**
 * Creates a light account client using the provided parameters, including account information, transport mechanism, blockchain chain, and additional client configurations. This function first creates a light account and then uses it to create a smart account client, extending it with light account client actions.
 *
 * Also, we modified the return type to be the light account alchemy client if the transport is alchemy.
 *
 * @example
 * ```ts
 * import { createLightAccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createLightAccountClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateLightAccountClientParams} params The parameters for creating a light account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` object containing the created account information and methods
 */
export async function createLightAccountClient(
  params: CreateLightAccountClientParams
): Promise<SmartAccountClient | AlchemySmartAccountClient> {
  const { transport, chain } = params;

  if (isAlchemyTransport(transport, chain)) {
    return await createLightAccountAlchemyClient({
      ...params,
      transport,
    });
  }

  const lightAccount = await createLightAccount({
    ...params,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...params,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}

function isAlchemyTransport(
  transport: Transport,
  chain: Chain
): transport is AlchemyTransport {
  return transport({ chain }).config.type === "alchemy";
}

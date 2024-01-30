import {
  createClient,
  custom,
  publicActions,
  type Chain,
  type Client,
  type ClientConfig,
  type CustomTransport,
  type PublicActions,
  type PublicRpcSchema,
  type RpcSchema,
  type Transport,
} from "viem";
import { z } from "zod";
import type { SmartContractAccount } from "../account/smartContractAccount.js";
import { middlewareActions } from "../middleware/actions.js";
import type { ClientMiddleware } from "../middleware/types.js";
import type { Prettify } from "../utils/index.js";
import {
  erc4337ClientActions,
  type Erc4337Actions,
  type Erc4337RpcSchema,
} from "./decorators/publicErc4337Client.js";
import {
  smartAccountClientDecorator,
  type BaseSmartAccountClientActions,
} from "./decorators/smartAccountClient.js";
import type { PublicErc4337Client } from "./publicErc4337Client.js";
import { SmartAccountClientOptsSchema } from "./schema.js";

type SmartAccountClientOpts = z.output<typeof SmartAccountClientOptsSchema>;

export type SmartAccountClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account>,
    "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "transport"
  > & {
    account?: account;
    opts?: z.input<typeof SmartAccountClientOptsSchema>;
  } & Partial<ClientMiddleware>
>;

export type SmartAccountClientRpcSchema = [
  ...Erc4337RpcSchema,
  ...PublicRpcSchema
];

export type SmartAccountClientActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = BaseSmartAccountClientActions<chain, account> &
  Erc4337Actions &
  PublicActions;

export type SmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends SmartAccountClientActions<
    chain,
    account
  > = SmartAccountClientActions<chain, account>,
  rpcSchema extends RpcSchema = SmartAccountClientRpcSchema
> = Prettify<Client<transport, chain, account, rpcSchema, actions>>;

export type BaseSmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Prettify<
  Client<
    transport,
    chain,
    account,
    [...Erc4337RpcSchema, ...PublicRpcSchema],
    { middleware: ClientMiddleware } & SmartAccountClientOpts &
      Erc4337Actions &
      PublicActions
  >
>;

export function createSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  config: SmartAccountClientConfig<TTransport, TChain, TAccount>
): SmartAccountClient<TTransport, TChain, TAccount>;

export function createSmartAccountClient(
  config: SmartAccountClientConfig
): SmartAccountClient {
  const {
    key = "account",
    name = "account provider",
    transport,
    ...params
  } = config;

  const client = createClient({
    ...params,
    key,
    name,
    type: "SmartAccountProvider",
    // TODO: our OG provider also has handlers for some various RPC methods
    // we should support those here as well
    transport,
  });

  return client
    .extend(() => ({
      ...SmartAccountClientOptsSchema.parse(config.opts ?? {}),
    }))
    .extend(publicActions)
    .extend(erc4337ClientActions)
    .extend(middlewareActions(config))
    .extend((client) => smartAccountClientDecorator(client));
}

export function createSmartAccountClientFromExisting<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TClient extends PublicErc4337Client<TTransport> = PublicErc4337Client<TTransport>,
  TActions extends SmartAccountClientActions<
    TChain,
    TAccount
  > = SmartAccountClientActions<TChain, TAccount>,
  TRpcSchema extends SmartAccountClientRpcSchema = SmartAccountClientRpcSchema
>(
  config: Omit<
    SmartAccountClientConfig<Transport, TChain, TAccount>,
    "transport"
  > & { client: TClient }
): SmartAccountClient<CustomTransport, TChain, TAccount, TActions, TRpcSchema>;

export function createSmartAccountClientFromExisting(
  config: Omit<SmartAccountClientConfig, "transport"> & {
    client: PublicErc4337Client;
  }
): SmartAccountClient {
  return createSmartAccountClient({
    ...config,
    chain: config.client.chain,
    transport: custom(config.client),
  });
}

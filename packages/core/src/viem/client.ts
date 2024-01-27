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
  type Transport,
} from "viem";
import { z } from "zod";
import { erc4337ClientActions } from "../client/create-client.js";
import type {
  Erc4337Actions,
  Erc4337RpcSchema,
  PublicErc4337Client,
} from "../client/types";
import { SmartAccountProviderOptsSchema } from "../provider/schema.js";
import type { Prettify } from "../utils";
import type { SmartContractAccount } from "./account";
import {
  smartAccountClientDecorator,
  type BaseSmartAccountClientActions,
} from "./decorator.js";
import { middlewareActions } from "./middleware/actions.js";
import type { ClientMiddleware } from "./middleware/types";

type SmartAccountProviderOpts = z.output<typeof SmartAccountProviderOptsSchema>;

export type SmartAccountClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
  // client extends PublicErc4337Client<transport> | undefined =
  //   | PublicErc4337Client<transport>
  //   | undefined
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account>,
    "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "transport"
  > & {
    account?: account;
    opts?: z.input<typeof SmartAccountProviderOptsSchema>;
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
  rpcSchema extends SmartAccountClientRpcSchema = SmartAccountClientRpcSchema
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
    { middleware: ClientMiddleware } & SmartAccountProviderOpts &
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
      ...SmartAccountProviderOptsSchema.parse(config.opts ?? {}),
    }))
    .extend(publicActions)
    .extend(erc4337ClientActions)
    .extend(middlewareActions(config))
    .extend((client) => smartAccountClientDecorator(client));
}

export function createSmartAccountClientFromExisting<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TClient extends PublicErc4337Client = PublicErc4337Client
>(
  config: Omit<
    SmartAccountClientConfig<Transport, TChain, TAccount>,
    "transport"
  > & { client: TClient }
): SmartAccountClient<CustomTransport, TChain, TAccount>;

export function createSmartAccountClientFromExisting(
  config: Omit<SmartAccountClientConfig, "transport"> & {
    client: PublicErc4337Client;
  }
): SmartAccountClient {
  return createSmartAccountClient({
    ...config,
    transport: custom(config.client),
  });
}

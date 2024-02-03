import {
  custom,
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
import { createBundlerClient, type BundlerClient } from "./bundlerClient.js";
import {
  type BundlerActions,
  type BundlerRpcSchema,
} from "./decorators/bundlerClient.js";
import {
  smartAccountClientActions,
  type BaseSmartAccountClientActions,
} from "./decorators/smartAccountClient.js";
import { SmartAccountClientOptsSchema } from "./schema.js";
import type { ClientMiddlewareConfig } from "./types.js";

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
  } & ClientMiddlewareConfig
>;

export type SmartAccountClientRpcSchema = [
  ...BundlerRpcSchema,
  ...PublicRpcSchema
];

export type SmartAccountClientActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = BaseSmartAccountClientActions<chain, account> &
  BundlerActions &
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
    [...BundlerRpcSchema, ...PublicRpcSchema],
    { middleware: ClientMiddleware } & SmartAccountClientOpts &
      BundlerActions &
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

  const client = createBundlerClient({
    ...params,
    key,
    name,
    type: "SmartAccountClient",
    // TODO: our OG provider also has handlers for some various RPC methods
    // we should support those here as well
    transport,
  });

  return client
    .extend(() => ({
      ...SmartAccountClientOptsSchema.parse(config.opts ?? {}),
    }))
    .extend(middlewareActions(config))
    .extend(smartAccountClientActions);
}

export function createSmartAccountClientFromExisting<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TClient extends BundlerClient<TTransport> = BundlerClient<TTransport>,
  TActions extends SmartAccountClientActions<
    TChain,
    TAccount
  > = SmartAccountClientActions<TChain, TAccount>,
  TRpcSchema extends SmartAccountClientRpcSchema = SmartAccountClientRpcSchema
>(
  config: Omit<
    SmartAccountClientConfig<Transport, TChain, TAccount>,
    "transport" | "chain"
  > & { client: TClient }
): SmartAccountClient<CustomTransport, TChain, TAccount, TActions, TRpcSchema>;

export function createSmartAccountClientFromExisting(
  config: Omit<SmartAccountClientConfig, "transport" | "chain"> & {
    client: BundlerClient;
  }
): SmartAccountClient {
  return createSmartAccountClient({
    ...config,
    chain: config.client.chain,
    transport: custom(config.client),
  });
}

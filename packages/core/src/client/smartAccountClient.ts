import {
  custom,
  type Chain,
  type Client,
  type ClientConfig,
  type CustomTransport,
  type FormattedTransactionRequest,
  type PublicActions,
  type PublicRpcSchema,
  type RpcSchema,
  type Transport,
} from "viem";
import { z } from "zod";
import type { SmartContractAccount } from "../account/smartContractAccount.js";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { AccountNotFoundError } from "../errors/account.js";
import { ChainNotFoundError } from "../errors/client.js";
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
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined
> = Prettify<
  Pick<
    ClientConfig<transport, chain, account>,
    | "cacheTime"
    | "chain"
    | "key"
    | "name"
    | "pollingInterval"
    | "transport"
    | "type"
  > & {
    account?: account;
    opts?: z.input<typeof SmartAccountClientOptsSchema>;
  } & ClientMiddlewareConfig
>;

export type SmartAccountClientRpcSchema<
  TEntryPointVersion extends EntryPointVersion
> = [...BundlerRpcSchema<TEntryPointVersion>, ...PublicRpcSchema];

//#region SmartAccountClientActions
export type SmartAccountClientActions<
  version extends EntryPointVersion,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined
> = BaseSmartAccountClientActions<version, chain, account> &
  BundlerActions<version> &
  PublicActions;
//#endregion SmartAccountClientActions

//#region SmartAccountClient
export type SmartAccountClient<
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined,
  actions extends SmartAccountClientActions<
    version,
    chain,
    account
  > = SmartAccountClientActions<version, chain, account>,
  rpcSchema extends RpcSchema = SmartAccountClientRpcSchema<version>
> = Prettify<Client<transport, chain, account, rpcSchema, actions>>;
//#endregion SmartAccountClient

export type BaseSmartAccountClient<
  version extends EntryPointVersion,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount<version> | undefined =
    | SmartContractAccount<version>
    | undefined
> = Prettify<
  Client<
    transport,
    chain,
    account,
    [...BundlerRpcSchema<version>, ...PublicRpcSchema],
    { middleware: ClientMiddleware } & SmartAccountClientOpts &
      BundlerActions<version> &
      PublicActions
  >
>;

export function createSmartAccountClient<
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends SmartContractAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  config: SmartAccountClientConfig<
    TEntryPointVersion,
    TTransport,
    TChain,
    TAccount
  >
): SmartAccountClient<TEntryPointVersion, TTransport, TChain, TAccount> {
  const {
    key = "account",
    name = "account provider",
    transport,
    type = "SmartAccountClient",
    ...params
  } = config;

  const entryPoint = params.account?.getEntryPoint();
  const _createBundlerClient =
    entryPoint?.version === "0.6.0"
      ? createBundlerClient<"0.6.0", Transport>
      : entryPoint?.version === "0.7.0"
      ? createBundlerClient<"0.7.0", Transport>
      : createBundlerClient<TEntryPointVersion, Transport>;

  const client: SmartAccountClient<TEntryPointVersion> = _createBundlerClient({
    ...params,
    key,
    name,
    // we start out with this because the base methods for a SmartAccountClient
    // require a smart account client, but once we have completed building everything
    // we want to override this value with the one passed in by the extender
    type: "SmartAccountClient",
    // TODO: this needs to be tested
    transport: (opts) => {
      const rpcTransport = transport(opts);

      return custom({
        async request({ method, params }) {
          switch (method) {
            case "eth_sendTransaction":
              if (!client.account) {
                throw new AccountNotFoundError();
              }
              if (!client.chain) {
                throw new ChainNotFoundError();
              }
              const [tx] = params as [FormattedTransactionRequest];
              return client.sendTransaction({
                ...tx,
                account: client.account,
                chain: client.chain,
              });
            case "eth_sign":
              if (!client.account) {
                throw new AccountNotFoundError();
              }
              const [address, data] = params!;
              if (address !== client.account.address) {
                throw new Error(
                  "cannot sign for address that is not the current account"
                );
              }
              return client.signMessage(data);
            case "personal_sign": {
              if (!client.account) {
                throw new AccountNotFoundError();
              }
              const [data, address] = params!;
              if (address !== client.account.address) {
                throw new Error(
                  "cannot sign for address that is not the current account"
                );
              }
              return client.signMessage(data);
            }
            case "eth_signTypedData_v4": {
              if (!client.account) {
                throw new AccountNotFoundError();
              }
              const [address, dataParams] = params!;
              if (address !== client.account.address) {
                throw new Error(
                  "cannot sign for address that is not the current account"
                );
              }
              return client.signTypedData(dataParams);
            }
            case "eth_chainId":
              if (!opts.chain) {
                throw new ChainNotFoundError();
              }

              return opts.chain.id;
            default:
              // TODO: there's probably a number of methods we just don't support, will need to test most of them out
              // first let's get something working though
              return rpcTransport.request({ method, params });
          }
        },
      })(opts);
    },
  })
    .extend(() => ({
      ...SmartAccountClientOptsSchema.parse(config.opts ?? {}),
    }))
    .extend(middlewareActions(config))
    .extend(smartAccountClientActions);

  return { ...client, type } as SmartAccountClient<
    TEntryPointVersion,
    TTransport,
    TChain,
    TAccount
  >;
}

export function createSmartAccountClientFromExisting<
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends SmartContractAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TClient extends BundlerClient<TEntryPointVersion, TTransport> = BundlerClient<
    TEntryPointVersion,
    TTransport
  >,
  TActions extends SmartAccountClientActions<
    TEntryPointVersion,
    TChain,
    TAccount
  > = SmartAccountClientActions<TEntryPointVersion, TChain, TAccount>,
  TRpcSchema extends SmartAccountClientRpcSchema<TEntryPointVersion> = SmartAccountClientRpcSchema<TEntryPointVersion>
>(
  config: Omit<
    SmartAccountClientConfig<TEntryPointVersion, Transport, TChain, TAccount>,
    "transport" | "chain"
  > & { client: TClient }
): SmartAccountClient<
  TEntryPointVersion,
  CustomTransport,
  TChain,
  TAccount,
  TActions,
  TRpcSchema
> {
  return createSmartAccountClient<
    TAccount,
    TEntryPointVersion,
    CustomTransport,
    TChain
  >({
    ...config,
    chain: config.client.chain,
    transport: custom(config.client),
  }) as SmartAccountClient<
    TEntryPointVersion,
    CustomTransport,
    TChain,
    TAccount,
    TActions,
    TRpcSchema
  >;
}

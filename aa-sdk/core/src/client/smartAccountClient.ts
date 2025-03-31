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
import type { UserOperationContext } from "../actions/smartAccount/types.js";
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
import { ADD_BREADCRUMB } from "./addBreadcrumb.js";

type SmartAccountClientOpts = z.output<typeof SmartAccountClientOptsSchema>;

export type SmartAccountClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  context extends UserOperationContext | undefined =
    | UserOperationContext
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
    /**
     * A function that adds a breadcrumb to the current context
     * Note, most implementations will override the client with the default alchemy transport and this
     * leads to the fact that a transport could be overwritten and not known until later.
     *
     * @param crumb A crumb, or span is telling that we are in a next step part of a multi step action
     * @returns
     */
    addBreadCrumb?: <T>(crumb: string) => T;
  } & ClientMiddlewareConfig<context>
>;

export type SmartAccountClientRpcSchema = [
  ...BundlerRpcSchema,
  ...PublicRpcSchema
];

// [!region SmartAccountClientActions]
export type SmartAccountClientActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = BaseSmartAccountClientActions<chain, account, context> &
  BundlerActions &
  PublicActions;
// [!endregion SmartAccountClientActions]

// [!region SmartAccountClient]
export type SmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  actions extends Record<string, unknown> = Record<string, unknown>,
  rpcSchema extends RpcSchema = SmartAccountClientRpcSchema,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Prettify<
  Client<
    transport,
    chain,
    account,
    rpcSchema,
    actions & SmartAccountClientActions<chain, account, context>
  >
>;
// [!endregion SmartAccountClient]

export type BaseSmartAccountClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  context extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Prettify<
  Client<
    transport,
    chain,
    account,
    [...BundlerRpcSchema, ...PublicRpcSchema],
    {
      middleware: ClientMiddleware<context>;
    } & SmartAccountClientOpts &
      BundlerActions &
      PublicActions
  >
>;

export function createSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  config: SmartAccountClientConfig<TTransport, TChain, TAccount, TContext>
): SmartAccountClient<TTransport, TChain, TAccount>;

/**
 * Creates a smart account client using the provided configuration. This client handles various Ethereum transactions and message signing operations.
 *
 * @example
 * ```ts
 * import { createSmartAccountClient, toSmartContractAccount } from "@aa-sdk/core";
 * import { http } from "viem";
 * import { sepolia } from "viem/chains";
 *
 * const client = createSmartAccountClient({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  // optionally hoist the account
 *  account: toSmartContractAccount(...),
 * });
 * ```
 *
 * @param {SmartAccountClientConfig} config The configuration for creating the smart account client
 * @returns {SmartAccountClient} A smart account client capable of handling transactions, message signing, and other operations on a smart account
 */
export function createSmartAccountClient(
  config: SmartAccountClientConfig
): SmartAccountClient {
  const {
    key = "account",
    name = "account provider",
    transport,
    type = "SmartAccountClient",
    addBreadCrumb,
    ...params
  } = config;

  const client: SmartAccountClient = createBundlerClient({
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
        name: "SmartAccountClientTransport",
        async request({ method, params }) {
          switch (method) {
            case "eth_accounts": {
              if (!client.account) {
                throw new AccountNotFoundError();
              }

              return [client.account.address];
            }
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
              return client.signMessage({
                message: data,
                account: client.account,
              });
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
              return client.signMessage({
                message: data,
                account: client.account,
              });
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
    .extend(() => {
      const addBreadCrumbs = addBreadCrumb
        ? {
            [ADD_BREADCRUMB]: addBreadCrumb,
          }
        : {};
      return {
        ...SmartAccountClientOptsSchema.parse(config.opts ?? {}),
        ...addBreadCrumbs,
      };
    })
    .extend(middlewareActions(config))
    .extend(smartAccountClientActions);

  return { ...client, type };
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
    TAccount,
    TContext
  > = SmartAccountClientActions<TChain, TAccount>,
  TRpcSchema extends SmartAccountClientRpcSchema = SmartAccountClientRpcSchema,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  config: Omit<
    SmartAccountClientConfig<Transport, TChain, TAccount, TContext>,
    "transport" | "chain"
  > & { client: TClient }
): SmartAccountClient<
  CustomTransport,
  TChain,
  TAccount,
  TActions,
  TRpcSchema,
  TContext
>;

/**
 * Creates a smart account client using an existing client and specific configuration. This function can be used to reuse a pre-existing BundlerClient while customizing other aspects of the smart account.
 *
 * @example
 * ```ts
 * import {
 *   createBundlerClient,
 *   createSmartAccountClientFromExisting,
 *   toSmartContractAccount
 * } from "@aa-sdk/core";
 *
 * const bundlerClient = createBundlerClient(...);
 * const client = createSmartAccountClientFromExisting({
 *  client,
 *  account: toSmartContractAccount(...),
 * })
 * ```
 *
 * @param {Omit<SmartAccountClientConfig, "transport" | "chain"> & {client: BundlerClient}} config the configuration object which includes the client
 * @returns {SmartAccountClient} A smart account client created from the existing BundlerClient
 */
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

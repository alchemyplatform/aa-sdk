import {
  createClient,
  Address,
  Chain,
  Client,
  LocalAccount,
  ParseAccount,
  Transport,
  createWalletClient,
  custom,
  toHex,
  Hex,
  WalletRpcSchema,
} from "viem";
import {
  smartWalletActions,
  type SmartWalletActions,
} from "./decorators/smartWalletActions.js";
import { BaseError, type AlchemyTransport } from "@alchemy/common";
import type {
  BaseWalletClient,
  ExtractRpcMethod,
  SignerClient,
  SmartWalletClientRpcSchema,
} from "./types.js";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import { createInternalState } from "./internal.js";
import { AccountNotFoundError } from "../../../aa-sdk/core/src/errors/account.js";
import { ChainNotFoundError } from "../../../aa-sdk/core/src/errors/client.js";

export type CreateSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  signer: LocalAccount | SignerClient;
  transport: AlchemyTransport;
  chain: Chain;
  account?: TAccount;
  // TODO(v5): Reconsider if the client store store the policyIds, especially as
  // new paymaster fields (i.e. for erc-20 support) are introduced. It might make
  // more sense for them to be stored at a higher level like in the wagmi config
  // or hooks.
  policyId?: string;
  policyIds?: string[];
};

/**
 * Creates a smart wallet client with wallet API actions.
 *
 * @param {CreateSmartWalletClientParams} params - Parameters for creating the smart wallet client.
 * @param {LocalAccount | JsonRpcAccount} params.account - The account to use for signing.
 * @param {AlchemyTransport} params.transport - The transport to use for RPC calls.
 * @param {Chain} params.chain - The blockchain network to connect to.
 * @param {string[]} params.policyIds - Optional policy IDs for paymaster service.
 * @returns {WalletClient} A wallet client extended with smart wallet actions.
 */
export const createSmartWalletClient = <
  TAccount extends Address | undefined = Address | undefined,
>({
  account,
  transport,
  chain,
  signer,
  policyId,
  policyIds,
}: CreateSmartWalletClientParams<TAccount>): BaseWalletClient<
  SmartWalletActions<TAccount>
> => {
  const _policyIds = [
    ...(policyId ? [policyId] : []),
    ...(policyIds?.length ? policyIds : []),
  ];

  // If the signer is a `LocalAccount` wrap it inside of a client now so
  // downstream actions can just use `getAction` to get signing actions
  // and `signerClient.account.address` to access the address.
  const signerClient =
    "request" in signer
      ? signer
      : createWalletClient({
          account: signer,
          transport,
          chain,
        });

  const baseClient = createClient({
    account,
    transport: (opts) => {
      const rpcTransport = transport(opts);

      const customTransport = custom({
        name: "SmartWalletClientTransport",
        // TODO(jh): can we make this more typesafe to ensure every supported method is covered,
        // get input types, and ensure we return the correct types?
        async request({ method, params }) {
          switch (method) {
            case "eth_chainId": {
              if (!opts.chain) {
                throw new ChainNotFoundError();
              }
              return toHex(opts.chain.id) satisfies ExtractRpcMethod<
                SmartWalletClientRpcSchema,
                "eth_chainId"
              >["ReturnType"];
            }

            case "eth_accounts": {
              if (!account) {
                throw new AccountNotFoundError();
              }
              return [account] satisfies ExtractRpcMethod<
                SmartWalletClientRpcSchema,
                "eth_accounts"
              >["ReturnType"];
            }

            case "personal_sign": {
              if (!baseClient.account) {
                throw new AccountNotFoundError();
              }
              const [data, address] = params as ExtractRpcMethod<
                SmartWalletClientRpcSchema,
                "personal_sign"
              >["Parameters"];

              if (address?.toLowerCase() !== account?.toLowerCase()) {
                throw new BaseError(
                  "Cannot sign for an address other than the current account.",
                );
              }
              // TODO(jh): how do we get rid of these circular errors????
              const sig: Hex = await baseClient.signMessage({
                message: data,
                account: address,
              });

              return sig satisfies ExtractRpcMethod<
                WalletRpcSchema,
                "personal_sign"
              >["ReturnType"];
            }

            // case "eth_sendTransaction":
            //   if (!client.account) {
            //     throw new AccountNotFoundError();
            //   }
            //   if (!client.chain) {
            //     throw new ChainNotFoundError();
            //   }
            //   const [tx] = params as [FormattedTransactionRequest];
            //   return client.sendTransaction({
            //     ...tx,
            //     account: client.account,
            //     chain: client.chain,
            //   });
            // case "eth_signTypedData_v4": {
            //   if (!client.account) {
            //     throw new AccountNotFoundError();
            //   }
            //   const [address, dataParams] = params!;
            //   if (
            //     address?.toLowerCase() !== client.account.address.toLowerCase()
            //   ) {
            //     throw new Error(
            //       "cannot sign for address that is not the current account",
            //     );
            //   }
            //   try {
            //     return client.signTypedData({
            //       account: client.account,
            //       typedData:
            //         typeof dataParams === "string"
            //           ? JSON.parse(dataParams)
            //           : dataParams,
            //     });
            //   } catch {
            //     throw new Error("invalid JSON data params");
            //   }
            // }
            // TODO(jh): wallet_sendCalls
            // TODO(jh): wallet_getCapabilities
            default:
              // TODO(jh): can even this be typesafe w/ the `WalletServerViemRpcSchema`?
              return rpcTransport.request({ method, params });
          }
        },
      })(opts);

      return {
        ...customTransport,
        ...rpcTransport,
        request: customTransport.request,
      };
    },
    chain,
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
    }))
    .extend(smartWalletActions(signerClient));

  return baseClient;
};

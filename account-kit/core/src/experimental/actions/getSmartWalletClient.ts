import {
  createSmartWalletClient,
  type SmartWalletClient,
} from "@account-kit/wallet-client";
import type { Address, JsonRpcAccount } from "viem";
import { getAlchemyTransport } from "../../actions/getAlchemyTransport.js";
import { getConnection } from "../../actions/getConnection.js";
import { getSigner } from "../../actions/getSigner.js";
import { getSignerStatus } from "../../actions/getSignerStatus.js";
import { SignerNotConnectedError } from "../../errors.js";
import type { AlchemyAccountsConfig } from "../../types.js";

export type GetSmartWalletClientResult<
  TAccount extends Address | undefined = Address | undefined,
> = SmartWalletClient<
  TAccount extends Address ? JsonRpcAccount<TAccount> : undefined
>;

export type GetSmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = { account?: TAccount };

export function getSmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
>(
  config: AlchemyAccountsConfig,
  params?: GetSmartWalletClientParams<TAccount>,
): GetSmartWalletClientResult<TAccount>;

export function getSmartWalletClient(
  config: AlchemyAccountsConfig,
  params?: GetSmartWalletClientParams,
): GetSmartWalletClientResult {
  const connection = getConnection(config);
  const signerStatus = getSignerStatus(config);
  const transport = getAlchemyTransport(config);
  const signer = getSigner(config);

  if (!signer || !signerStatus.isConnected) {
    throw new SignerNotConnectedError();
  }

  const smartWalletClient =
    config.store.getState().smartWalletClients[connection.chain.id];

  if (
    smartWalletClient &&
    smartWalletClient.account?.address === params?.account
  ) {
    return smartWalletClient;
  }

  // TODO: should we still cache the client like we used to?
  // honestly that probably caused more problems than it solved
  // TBD actually, we might store it in the store so we don't run into issues
  // with react
  const client = createSmartWalletClient({
    transport,
    chain: connection.chain,
    signer,
    // @ts-expect-error need to fix this in the wallet-client sdk
    account: params?.account,
    mode: config.mode,
  });

  config.store.setState((state) => ({
    smartWalletClients: {
      ...state.smartWalletClients,
      [connection.chain.id]: client,
    },
  }));

  return client;
}

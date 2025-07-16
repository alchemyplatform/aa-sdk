import type { SmartAccountSigner } from "@aa-sdk/core";
import type { AlchemyTransport } from "@account-kit/infra";
import {
  type Address,
  type Chain,
  type Prettify,
  createClient,
  custom,
} from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import {
  smartWalletClientActions,
  type SmartWalletActions,
} from "./decorator.js";
import { Provider } from "ox";
import { WalletServerRpcSchema } from "@alchemy/wallet-api-types/rpc";
import { internalStateDecorator } from "../internal/decorator.js";
import { metrics } from "../metrics.js";

export type SmartWalletClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = Prettify<
  {
    transport: AlchemyTransport;
    chain: Chain;
    signer: SmartAccountSigner;
    account?: TAccount | Address | undefined;
  } & (
    | { policyId?: string; policyIds?: never }
    | { policyIds?: string[]; policyId?: never }
  )
>;

export type SmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
> = InnerWalletApiClient & SmartWalletActions<TAccount>;

/**
 * Creates a smart wallet client that can be used to interact with a smart account.
 *
 * @param {SmartWalletClientParams} params - The parameters for creating the smart wallet client
 * @param {AlchemyTransport} params.transport - The Alchemy transport to use
 * @param {Chain} params.chain - The chain to use
 * @param {SmartAccountSigner} params.signer - The signer to use for the smart account
 * @param {string} [params.policyId] - The policy ID for gas sponsorship (optional)
 * @param {Address} [params.account] - The smart account address to use (optional)
 * @returns {SmartWalletClient} - A viem-compatible client
 *
 * @example
 * ```ts
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { alchemy, arbitrumSepolia } from "@account-kit/infra";
 * import { generatePrivateKey } from "viem/accounts";
 * import { createSmartWalletClient } from "@account-kit/wallet-client";
 *
 * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
 * const transport = alchemy({
 *   apiKey: "your-alchemy-api-key",
 * });
 * const client = createSmartWalletClient({
 *   transport,
 *   chain: arbitrumSepolia,
 *   signer,
 * });
 * ```
 */
export function createSmartWalletClient<
  TAccount extends Address | undefined = undefined,
>(params: SmartWalletClientParams<TAccount>): SmartWalletClient<TAccount>;

export function createSmartWalletClient(
  params: SmartWalletClientParams,
): SmartWalletClient {
  const { transport, chain, account, signer } = params;

  const policyIds = params.policyId
    ? [params.policyId]
    : params.policyIds
      ? params.policyIds
      : undefined;

  const innerClient = createClient({
    transport: (opts) =>
      custom(Provider.from(transport(opts), { schema: WalletServerRpcSchema }))(
        opts,
      ),
    chain,
    account,
  }).extend(() => ({
    policyIds,
    internal: internalStateDecorator(),
  }));

  metrics.trackEvent({
    name: "client_created",
    data: {
      chainId: params.chain.id,
    },
  });

  // TODO: potentially we might want to make this client async and have it use `requestAccount` so that it can create a SCA client with an account attached to it
  return innerClient.extend((client) =>
    smartWalletClientActions(client, signer),
  );
}

// Example usage:
// const clientWithoutAccount = createSmartWalletClient({
//   transport: alchemy({ apiKey: "123" }),
//   chain: baseSepolia,
//   signer: createDummySigner(zeroAddress),
// });

// const account1 = await clientWithoutAccount.requestAccount();

// const clientWithAccount = createSmartWalletClient({
//   transport: alchemy({ apiKey: "123" }),
//   chain: baseSepolia,
//   signer: createDummySigner(zeroAddress),
//   account: zeroAddress,
// });

// const account2 = await clientWithAccount.requestAccount();

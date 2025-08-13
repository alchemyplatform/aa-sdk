import type {
  Address,
  Chain,
  Client,
  Hex,
  JsonRpcAccount,
  LocalAccount,
} from "viem";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc"; // TODO(jh): can we be careful not to use any non-type imports from typebox to avoid RN issues?
import type { AlchemyTransport } from "@alchemy/common";

// export type CreateInnerClientParams<
//   TAccount extends Address | undefined = Address | undefined,
// > = {
//   chain: Chain;
//   transport: AlchemyTransport;
//   policyIds?: string[];
//   account?: TAccount | Address | undefined;
// };

export type InnerWalletApiClientBase<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  AlchemyTransport, // TODO(jh): correct type for here?
  Chain,
  // TODO(jh): is this the correct type? this will be the signer? should it never be `undefined`?
  JsonRpcAccount<Address> | LocalAccount<Address> | undefined,
  WalletServerViemRpcSchema,
  // TODO(jh): still have policyIds here?
  { policyIds?: string[] } & TExtend
>;

// TODO(jh): do we still want to cache?
// export type CachedAccount = {
//   account: SmartAccount;
//   requestParams: RequestAccountParams;
// };

// TODO(jh): do we still want internal state?
// export type InternalState = {
//   setAccount: (account: CachedAccount) => void;
//   getAccount: () => CachedAccount | undefined;
// };

export type InnerWalletApiClient = InnerWalletApiClientBase<{
  // TODO(jh): do we need this?
  //   internal: InternalState;
}>;

export type WithoutChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId">
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;

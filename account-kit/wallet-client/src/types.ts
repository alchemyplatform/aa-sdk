import type { SmartContractAccount } from "@aa-sdk/core";
import type { AlchemyTransport } from "@account-kit/infra";
import type {
  Address,
  Chain,
  Client,
  Hex,
  JsonRpcAccount,
  Transport,
} from "viem";
import type { RequestAccountParams } from "./client/actions/requestAccount.ts";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";

export type CreateInnerClientParams<
  TAccount extends Address | undefined = Address | undefined,
> = {
  chain: Chain;
  transport: AlchemyTransport;
  policyIds?: string[];
  account?: TAccount | Address | undefined;
};

export type InnerWalletApiClientBase<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport,
  Chain,
  JsonRpcAccount<Address> | undefined,
  WalletServerViemRpcSchema,
  { policyIds?: string[] } & TExtend
>;

export type CachedAccount = {
  account: SmartContractAccount;
  requestParams: RequestAccountParams;
};

export type InternalState = {
  setAccount: (account: CachedAccount) => void;
  getAccount: () => CachedAccount | undefined;
};

export type InnerWalletApiClient = InnerWalletApiClientBase<{
  internal: InternalState;
}>;

export type WithoutChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId">
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

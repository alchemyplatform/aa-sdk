import { Address, SupportedTransports } from "@alchemy/aa-core";
import type {
  Chain,
  Client,
  PublicActions,
  PublicRpcSchema,
  Transport,
} from "viem";
import { GetTokenBalancesResponse } from "./types-api.js";

export type AlchemyEnhancedApiSchema = [
  ...PublicRpcSchema,
  {
    Method: "alchemy_getTokenBalances";
    Parameters: [Address, "erc20" | Address | Address[]];
    ReturnType: GetTokenBalancesResponse;
  }
];

export type AlchemyEnhancedApiActions = {
  getTokenBalances(
    address: Address,
    token: "erc20" | Address | Address[]
  ): Promise<GetTokenBalancesResponse>;
};

export type AlchemyEnhancedApiClient<
  T extends SupportedTransports = Transport,
  C extends Chain = Chain
> = Client<
  T,
  C,
  undefined,
  AlchemyEnhancedApiSchema,
  PublicActions<T, C> & AlchemyEnhancedApiActions
>;

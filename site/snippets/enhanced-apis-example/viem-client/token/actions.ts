import { Address } from "@alchemy/aa-core";
import { Chain, Client, Transport } from "viem";
import { GetTokenBalancesResponse } from "./types-api.js";
import { AlchemyEnhancedApiSchema } from "./types-client.js";

export const alchemyEnhancedApiActions = (client: Client) => {
  const clientAdapter = client as Client<
    Transport,
    Chain,
    undefined,
    AlchemyEnhancedApiSchema
  >;
  return {
    getTokenBalances(
      address: Address,
      token: "erc20" | Address | Address[]
    ): Promise<GetTokenBalancesResponse> {
      return clientAdapter.request({
        method: "alchemy_getTokenBalances",
        params: [address, token],
      });
    },
  };
};

import { Address } from "@alchemy/aa-core";
import { Chain, Client, Transport } from "viem";
import { OwnedNftsResponse } from "./types-api.js";
import { AlchemyEnhancedApiSchema } from "./types-client.js";

export const alchemyEnhancedApiActions = (client: Client) => {
  const clientAdapter = client as Client<
    Transport,
    Chain,
    undefined,
    AlchemyEnhancedApiSchema
  >;
  return {
    getNftsForOwner(owner: Address): Promise<OwnedNftsResponse> {
      return clientAdapter.request({
        method: "alchemy_getNftsForOwner",
        params: [owner],
      });
    },
  };
};

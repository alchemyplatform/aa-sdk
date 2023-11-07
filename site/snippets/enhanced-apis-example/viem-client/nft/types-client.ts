import { Address, SupportedTransports } from "@alchemy/aa-core";
import type {
  Chain,
  Client,
  PublicActions,
  PublicRpcSchema,
  Transport,
} from "viem";
import { OwnedNftsResponse } from "./types-api.js";

export type AlchemyEnhancedApiSchema = [
  ...PublicRpcSchema,
  {
    Method: "alchemy_getNftsForOwner";
    Parameters: [Address];
    ReturnType: OwnedNftsResponse;
  }
];

export type AlchemyEnhancedApiActions = {
  getNftsForOwner(owner: Address): Promise<OwnedNftsResponse>;
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

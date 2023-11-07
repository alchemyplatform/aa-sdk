import { Address, Hex } from "viem";

/**
 * The following types are taken from the alchemy-sdk package, with slight modifications for sake of example.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

export interface GetTokenBalancesResponse {
  address: Address;
  tokenBalances: {
    contractAddress: Address;
    tokenBalance: Hex;
  }[];
}

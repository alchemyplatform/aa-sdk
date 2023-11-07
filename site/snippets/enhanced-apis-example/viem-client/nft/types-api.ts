import { OwnedNft } from "./types-helpers.js";

/**
 * The following types are taken from the alchemy-sdk package, with slight modifications for sake of example.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

export interface OwnedNftsResponse {
  readonly ownedNfts: OwnedNft[];
  readonly pageKey?: string;
  readonly totalCount: number;
  blockHash: string;
}

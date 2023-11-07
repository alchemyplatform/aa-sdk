/**
 * The following types are taken from the alchemy-sdk package, with slight modifications for sake of example.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

export enum NftTokenType {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  NO_SUPPORTED_NFT_STANDARD = "NO_SUPPORTED_NFT_STANDARD",
  NOT_A_CONTRACT = "NOT_A_CONTRACT",
  UNKNOWN = "UNKNOWN",
}

export enum OpenSeaSafelistRequestStatus {
  VERIFIED = "verified",
  APPROVED = "approved",
  REQUESTED = "requested",
  NOT_REQUESTED = "not_requested",
}

export enum NftSpamClassification {
  Erc721TooManyOwners = "Erc721TooManyOwners",
  Erc721TooManyTokens = "Erc721TooManyTokens",
  Erc721DishonestTotalSupply = "Erc721DishonestTotalSupply",
  MostlyHoneyPotOwners = "MostlyHoneyPotOwners",
  OwnedByMostHoneyPots = "OwnedByMostHoneyPots",
}

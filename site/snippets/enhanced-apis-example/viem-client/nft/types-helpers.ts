import {
  NftSpamClassification,
  NftTokenType,
  OpenSeaSafelistRequestStatus,
} from "./types-enums.js";

/**
 * The following types are taken from the alchemy-sdk package, with slight modifications for sake of example.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

export interface NftContract {
  address: string;
  tokenType: NftTokenType;
  name?: string;
  symbol?: string;
  totalSupply?: string;
  openseaMetadata: OpenSeaCollectionMetadata;
  contractDeployer?: string;
  deployedBlockNumber?: number;
}

export interface OwnedNft {
  contract: NftContract;
  tokenId: string;
  tokenType: NftTokenType;
  title: string;
  balance: number;
  description: string;
  timeLastUpdated: string;
  metadataError: string | undefined;
  rawMetadata: NftMetadata | undefined;
  tokenUri: TokenUri | undefined;
  media: Media[];
  spamInfo?: SpamInfo;
  acquiredAt?: AcquiredAt;
}

export interface NftMetadata extends Record<string, any> {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  background_color?: string;
  attributes?: Array<Record<string, any>>;
}

export interface TokenUri {
  raw: string;
  gateway: string;
}

export interface Media {
  raw: string;
  gateway: string;
  thumbnail?: string;
  format?: string;
  size?: number;
  bytes?: number;
}

export interface SpamInfo {
  isSpam: boolean;
  classifications: NftSpamClassification[];
}

export interface AcquiredAt {
  blockTimestamp?: string;
  blockNumber?: number;
}

export interface OpenSeaCollectionMetadata {
  floorPrice?: number;
  collectionName?: string;
  safelistRequestStatus?: OpenSeaSafelistRequestStatus;
  imageUrl?: string;
  description?: string;
  externalUrl?: string;
  twitterUsername?: string;
  discordUrl?: string;
  lastIngestedAt?: string;
}

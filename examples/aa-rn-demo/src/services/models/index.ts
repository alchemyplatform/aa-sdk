import type { NftContract, NftTokenType } from "alchemy-sdk";

export interface ICardItem {
  title: string;
  tokenId?: string;
  tokenType?: NftTokenType;
  description: string;
  contract: NftContract;
  metadata: string;
  media: { raw: string; thumbnail?: string }[];
  price?: bigint;
}

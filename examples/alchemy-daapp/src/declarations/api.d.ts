export interface NFTData {
  contract: {
    address: string;
  };
  id: {
    tokenId: string;
    tokenMetadata: {
      tokenType: string;
    };
  };
  balance: string;
  title: string;
  description: string;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: {
    raw: string;
    gateway: string;
  }[];
  metadata: {
    name?: string;
    image?: string;
    attributes?: {
      value?: string;
      trait_type?: string;
    }[];
  };
  timeLastUpdated: string;
}
export interface OwnedNFTsResponse {
  ownedNfts: NFTData[];
  totalCount: number;
  blockHash: string;
}

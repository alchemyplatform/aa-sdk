import { useQuery } from "@tanstack/react-query";
import { getNFTs } from "../../http/endpoints";

export function useNFTsQuery(ethAddress?: string, chainId?: number) {
  return useQuery(["nfts", ethAddress, chainId], () => {
    return ethAddress && chainId
      ? getNFTs(ethAddress, chainId)
      : Promise.resolve({
          ownedNfts: [],
          totalCount: 0,
          blockHash: "0x000000000000",
        });
  });
}

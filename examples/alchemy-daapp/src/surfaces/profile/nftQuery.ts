import { useQuery } from "@tanstack/react-query";
import { getNFTs } from "../../http/endpoints";

export function useNFTsQuery(ethAddress?: string) {
  return useQuery(["nfts", ethAddress], () => {
    return ethAddress
      ? getNFTs(ethAddress)
      : Promise.resolve({
          ownedNfts: [],
          totalCount: 0,
          blockHash: "0x000000000000",
        });
  });
}

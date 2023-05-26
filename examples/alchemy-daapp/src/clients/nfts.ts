import {useQuery} from "@tanstack/react-query";
import {getNFTs} from "../http/endpoints";
import {OwnedNFTsResponse} from "../declarations/api";

export function useNFTsQuery(ethAddress?: string) {
  return useQuery(["nfts", ethAddress], () => {
    if (ethAddress) {
      return getNFTs(ethAddress);
    } else {
      return Promise.resolve({data: []} as unknown as OwnedNFTsResponse);
    }
  });
}

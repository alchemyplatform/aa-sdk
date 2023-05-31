import { OwnedNFTsResponse } from "../declarations/api";
import { callEndpoint } from "./http";

export function getNFTs(
  address: string,
  chainId: number
): Promise<OwnedNFTsResponse> {
  return callEndpoint("GET", "/api/nfts", {
    address,
    chainId,
  });
}

import { OwnedNFTsResponse } from "../declarations/api";
import { callEndpoint } from "./http";

export function getNFTs(address: string): Promise<OwnedNFTsResponse> {
  return callEndpoint("GET", "/api/nfts", {
    address,
  });
}

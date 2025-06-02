import { AlchemyTransport } from "@account-kit/infra";
import { useQuery } from "@tanstack/react-query";
import { type Address, parseAbi, type Chain } from "viem";
import { useModularAccountV2Client } from "./useModularAccountV2Client";

const NftContractAbi = parseAbi(["function baseURI() view returns (string)"]);

interface UseReadNFTUriParams {
  contractAddress?: Address;
  clientOptions: {
    mode: "default" | "7702";
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export const useReadNFTUri = (props: UseReadNFTUriParams) => {
  const { contractAddress, clientOptions } = props;

  const { client } = useModularAccountV2Client({
    ...clientOptions,
  });

  const {
    data: uri,
    isLoading,
    error,
  } = useQuery<
    string | undefined,
    Error,
    string | undefined,
    readonly unknown[]
  >({
    queryKey: ["nftBaseURI", contractAddress, client?.chain?.id],

    queryFn: async () => {
      if (!client) {
        throw new Error("Smart account client not ready");
      }
      if (!contractAddress) {
        throw new Error("Contract address is not defined for queryFn.");
      }
      const baseUriString = await client.readContract({
        address: contractAddress,
        abi: NftContractAbi,
        functionName: "baseURI",
      });
      return baseUriString;
    },
    enabled: !!client && !!contractAddress,
  });

  return { uri, isLoading, error };
};

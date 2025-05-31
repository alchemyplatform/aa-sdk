import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, formatUnits, parseAbi, Address } from "viem";
import { mainnet } from "viem/chains";

// Chainlink ETH/USD Price Feed on Ethereum Mainnet
const ETH_USD_PRICE_FEED_ADDRESS: Address =
  "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

const aggregatorV3InterfaceABI = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
]);

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // Uses default RPC for mainnet
});

interface EthPriceData {
  price: number;
  updatedAt: Date;
}

export interface UseGetEthPriceReturn {
  data: EthPriceData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useGetEthPrice = (): UseGetEthPriceReturn => {
  const { data, isLoading, isError, error, refetch } = useQuery<
    EthPriceData,
    Error
  >({
    queryKey: ["ethUsdPrice", ETH_USD_PRICE_FEED_ADDRESS, mainnet.id],
    queryFn: async () => {
      const [roundData, feedDecimals] = await Promise.all([
        publicClient.readContract({
          address: ETH_USD_PRICE_FEED_ADDRESS,
          abi: aggregatorV3InterfaceABI,
          functionName: "latestRoundData",
        }),
        publicClient.readContract({
          address: ETH_USD_PRICE_FEED_ADDRESS,
          abi: aggregatorV3InterfaceABI,
          functionName: "decimals",
        }),
      ]);

      const priceRaw = roundData[1];
      const updatedAtTimestamp = Number(roundData[3]);

      const priceFormatted = parseFloat(formatUnits(priceRaw, feedDecimals));

      return {
        price: priceFormatted,
        updatedAt: new Date(updatedAtTimestamp * 1000),
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

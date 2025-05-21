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

// Create a public client (could be instantiated once outside the hook if preferred)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // Uses default RPC for mainnet
});

interface EthPriceData {
  price: number; // The ETH price in USD
  updatedAt: Date; // Timestamp of the last update
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

      // latestRoundData returns: roundId, answer, startedAt, updatedAt, answeredInRound
      // The price is the 'answer' (index 1)
      const priceRaw = roundData[1];
      // The timestamp is 'updatedAt' (index 3)
      const updatedAtTimestamp = Number(roundData[3]);

      const priceFormatted = parseFloat(formatUnits(priceRaw, feedDecimals));

      return {
        price: priceFormatted,
        updatedAt: new Date(updatedAtTimestamp * 1000), // Convert Unix seconds to JS Date
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes: ETH price doesn't change every second, but we want it reasonably fresh
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

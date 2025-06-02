import { useQuery } from "@tanstack/react-query";

interface EthPriceData {
  price: number;
  updatedAt: Date;
}

interface AlchemyPriceResponse {
  data: Array<{
    symbol: string;
    prices: Array<{
      currency: string;
      value: string;
      lastUpdatedAt: string;
    }>;
  }>;
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
    queryKey: ["ethUsdPrice", "alchemy-api"],
    queryFn: async () => {
      const response = await fetch("/api/prices?symbols=ETH");

      if (!response.ok) {
        throw new Error(`Failed to fetch ETH price: ${response.statusText}`);
      }

      const result: AlchemyPriceResponse = await response.json();

      const ethData = result.data.find((item) => item.symbol === "ETH");
      if (!ethData) {
        throw new Error("ETH price data not found in response");
      }

      const usdPrice = ethData.prices.find((price) => price.currency === "usd");
      if (!usdPrice) {
        throw new Error("USD price not found for ETH");
      }

      return {
        price: parseFloat(usdPrice.value),
        updatedAt: new Date(usdPrice.lastUpdatedAt),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
};

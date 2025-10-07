"use client";

import { useCallback, useState } from "react";
import { useSmartWalletClient } from "./useSmartWalletClient.js";
import type {
  GetConfigResponse,
  GetQuotesResponse,
  Quote,
  CreateSessionResponse,
  PaymentMethod,
  GetConfigParams,
  GetQuotesParams,
  CreateSessionParams,
} from "./internal/walletFundingTypes.js";

// Utility function to generate idempotency key
function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock data for fallback behavior
const MOCK_CONFIG: GetConfigResponse = {
  countryCode: "US",
  defaults: {
    fiat: "USD",
    paymentMethod: "DEBIT_CARD",
    token: "USDC",
    recommendedProviderId: "coinbase",
  },
  catalog: {
    fiats: [{ code: "USD", name: "US Dollar" }],
    tokens: [
      { code: "USDC", name: "USD Coin", chain: "ethereum" },
      { code: "ETH", name: "Ethereum", chain: "ethereum" },
    ],
    paymentMethods: [
      { type: "APPLE_PAY", label: "Apple Pay" },
      { type: "DEBIT_CARD", label: "Debit Card", recommended: true },
      { type: "BANK_TRANSFER", label: "Bank transfer" },
    ],
  },
  limits: [
    {
      fiat: "USD",
      paymentMethod: "DEBIT_CARD",
      min: "10",
      max: "10000",
      default: "50",
      precision: 2,
    },
  ],
  ui: {
    quoteLockSeconds: 90,
  },
};

const MOCK_QUOTES: Quote[] = [
  {
    quoteId: "mock-quote-coinbase",
    providerId: "coinbase",
    badges: ["fastest"],
    destinationAmount: "49.95",
    exchangeRate: "1.01",
    fees: {
      processing: "0",
      network: "0",
      total: "0",
    },
    etaSeconds: 30,
    paymentMethod: "DEBIT_CARD",
    expiresAt: new Date(Date.now() + 90000).toISOString(),
  },
  {
    quoteId: "mock-quote-kraken",
    providerId: "kraken",
    badges: ["best_price"],
    destinationAmount: "50.00",
    exchangeRate: "1.00",
    fees: {
      processing: "0.50",
      network: "0.50",
      total: "1.00",
    },
    etaSeconds: 120,
    paymentMethod: "DEBIT_CARD",
    expiresAt: new Date(Date.now() + 90000).toISOString(),
  },
  {
    quoteId: "mock-quote-transak",
    providerId: "transak",
    destinationAmount: "48.75",
    exchangeRate: "1.01",
    fees: {
      processing: "1.25",
      network: "1.25",
      total: "2.50",
    },
    etaSeconds: 240,
    paymentMethod: "DEBIT_CARD",
    expiresAt: new Date(Date.now() + 90000).toISOString(),
  },
  {
    quoteId: "mock-quote-moonpay",
    providerId: "moonpay",
    destinationAmount: "49.00",
    exchangeRate: "1.01",
    fees: {
      processing: "1.00",
      network: "1.00",
      total: "2.00",
    },
    etaSeconds: 240,
    paymentMethod: "DEBIT_CARD",
    expiresAt: new Date(Date.now() + 90000).toISOString(),
  },
];

export interface UseWalletFundingResult {
  getConfig: (params: {
    countryCode: string;
  }) => Promise<GetConfigResponse | null>;
  getQuotes: (params: {
    countryCode: string;
    token: string;
    amount: string;
    fiat: string;
    paymentMethod: PaymentMethod;
    walletAddress?: string;
  }) => Promise<GetQuotesResponse | null>;
  createSession: (params: {
    quoteId: string;
  }) => Promise<CreateSessionResponse | null>;
  quotesCache: Quote[] | null;
  isLoading: boolean;
}

/**
 * Hook for interacting with wallet funding/onramp functionality
 *
 * @returns {UseWalletFundingResult} Wallet funding methods with caching
 *
 * @example
 * ```tsx
 * import { useWalletFunding } from "@account-kit/react";
 *
 * function FundingComponent() {
 *   const { getConfig, getQuotes, createSession, quotesCache, isLoading } = useWalletFunding();
 *
 *   // Get funding configuration
 *   useEffect(() => {
 *     getConfig({ countryCode: "US" }).then(config => {
 *       // Use config to set defaults, limits, etc.
 *     });
 *   }, []);
 *
 *   // Get quotes when amount changes
 *   const handleAmountChange = async (amount: string) => {
 *     const quotes = await getQuotes({
 *       countryCode: "US",
 *       token: "USDC",
 *       amount,
 *       fiat: "USD",
 *       paymentMethod: "DEBIT_CARD",
 *       walletAddress: "0x..." // optional, defaults to connected wallet
 *     });
 *   };
 *
 *   // Create session when user clicks continue
 *   const handleContinue = async (quoteId: string) => {
 *     const session = await createSession({ quoteId });
 *     if (session?.widgetUrl) {
 *       window.open(session.widgetUrl, "_blank");
 *     }
 *   };
 * }
 * ```
 */
export const useWalletFunding = (): UseWalletFundingResult => {
  const [quotesCache, setQuotesCache] = useState<Quote[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const walletClient = useSmartWalletClient({});

  const getConfig = useCallback(
    async ({
      countryCode,
    }: {
      countryCode: string;
    }): Promise<GetConfigResponse | null> => {
      try {
        // Check if we should use local funding server
        const useLocalFunding =
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_USE_LOCAL_FUNDING === "true";
        const localFundingUrl =
          process.env.NEXT_PUBLIC_LOCAL_FUNDING_URL || "http://localhost:4001";

        if (useLocalFunding) {
          const response = await fetch(localFundingUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "wallet_v0fundingGetConfig",
              params: [{ countryCode }],
              id: Date.now(),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message || "RPC Error");
          }

          return result.result;
        }

        if (!walletClient) {
          return MOCK_CONFIG;
        }

        const response = await (walletClient as any).request({
          method: "wallet_v0fundingGetConfig",
          params: [{ countryCode } as GetConfigParams],
        });
        return response as GetConfigResponse;
      } catch (error) {
        console.log("[Funding] Config fetch failed, using mock:", error);
        return MOCK_CONFIG;
      }
    },
    [walletClient],
  );

  const getQuotes = useCallback(
    async ({
      countryCode,
      token,
      amount,
      fiat,
      paymentMethod,
      walletAddress,
    }: {
      countryCode: string;
      token: string;
      amount: string;
      fiat: string;
      paymentMethod: PaymentMethod;
      walletAddress?: string;
    }): Promise<GetQuotesResponse | null> => {
      try {
        setIsLoading(true);

        if (!amount || parseFloat(amount) === 0) {
          // Return mock quotes with calculated amounts
          const mockQuotes = MOCK_QUOTES.map((quote) => ({
            ...quote,
            destinationAmount: (
              parseFloat(amount || "50") / parseFloat(quote.exchangeRate)
            ).toFixed(2),
            paymentMethod,
          }));
          setQuotesCache(mockQuotes);
          return {
            requestId: "mock-request",
            quotes: mockQuotes,
          };
        }

        // Check if we should use local funding server
        const useLocalFunding =
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_USE_LOCAL_FUNDING === "true";
        const localFundingUrl =
          process.env.NEXT_PUBLIC_LOCAL_FUNDING_URL || "http://localhost:4001";

        if (useLocalFunding) {
          const address =
            walletAddress ||
            walletClient?.account?.address ||
            "0x0000000000000000000000000000000000000000";

          const response = await fetch(localFundingUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "wallet_v0fundingGetQuotes",
              params: [
                {
                  countryCode,
                  source: {
                    amount,
                    currency: fiat,
                  },
                  destination: {
                    token,
                    chain: "ethereum",
                    walletAddress: address,
                  },
                  paymentMethod,
                  lock: true,
                },
              ],
              id: Date.now(),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message || "RPC Error");
          }

          if (result.result?.quotes) {
            console.log(
              "[Funding] Quotes from server:",
              JSON.stringify(result.result.quotes, null, 2),
            );
            setQuotesCache(result.result.quotes);
          }

          return result.result;
        }

        if (!walletClient) {
          // Return mock quotes even when no client is available
          const mockQuotes = MOCK_QUOTES.map((quote) => ({
            ...quote,
            destinationAmount: (
              parseFloat(amount || "50") / parseFloat(quote.exchangeRate)
            ).toFixed(2),
            paymentMethod,
          }));
          setQuotesCache(mockQuotes);
          return {
            requestId: "mock-request",
            quotes: mockQuotes,
          };
        }

        // Use wallet address or default to connected account
        const address =
          walletAddress ||
          walletClient.account?.address ||
          "0x0000000000000000000000000000000000000000";

        const response = await (walletClient as any).request({
          method: "wallet_v0fundingGetQuotes",
          params: [
            {
              countryCode,
              source: {
                amount,
                currency: fiat,
              },
              destination: {
                token,
                chain: "ethereum", // TODO: make this configurable
                walletAddress: address,
              },
              paymentMethod,
              lock: true,
            } as GetQuotesParams,
          ],
        });

        if (response.quotes) {
          console.log(
            "[Funding] Quotes from server:",
            JSON.stringify(response.quotes, null, 2),
          );
          setQuotesCache(response.quotes);
        }

        return response;
      } catch (error) {
        // Return mock quotes with calculated amounts
        const mockQuotes = MOCK_QUOTES.map((quote) => ({
          ...quote,
          destinationAmount: (
            parseFloat(amount || "50") / parseFloat(quote.exchangeRate)
          ).toFixed(2),
          paymentMethod,
        }));
        setQuotesCache(mockQuotes);
        return {
          requestId: "mock-request",
          quotes: mockQuotes,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient],
  );

  const createSession = useCallback(
    async ({
      quoteId,
    }: {
      quoteId: string;
    }): Promise<CreateSessionResponse | null> => {
      try {
        if (quoteId.startsWith("mock-")) {
          // Mock session for demo
          const providerId = quoteId.replace("mock-quote-", "") as any;
          return {
            sessionId: "mock-session",
            providerId,
            widgetUrl: `https://demo.${providerId}.com/onramp`,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          };
        }

        // Check if we should use local funding server
        const useLocalFunding =
          typeof window !== "undefined" &&
          process.env.NEXT_PUBLIC_USE_LOCAL_FUNDING === "true";
        const localFundingUrl =
          process.env.NEXT_PUBLIC_LOCAL_FUNDING_URL || "http://localhost:4001";

        if (useLocalFunding) {
          const response = await fetch(localFundingUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "wallet_v0fundingCreateSession",
              params: [
                {
                  quoteId,
                  idempotencyKey: generateIdempotencyKey(),
                },
              ],
              id: Date.now(),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error.message || "RPC Error");
          }

          return result.result;
        }

        if (!walletClient) {
          throw new Error("No wallet client available");
        }

        const response = await (walletClient as any).request({
          method: "wallet_v0fundingCreateSession",
          params: [
            {
              quoteId,
              idempotencyKey: generateIdempotencyKey(),
            } as CreateSessionParams,
          ],
        });

        return response;
      } catch (error: any) {
        // Handle quote expired error
        if (error.message?.includes("QUOTE_EXPIRED")) {
          throw new Error("Quote expired. Please refresh and try again.");
        }

        throw error;
      }
    },
    [walletClient],
  );

  return {
    getConfig,
    getQuotes,
    createSession,
    quotesCache,
    isLoading,
  };
};

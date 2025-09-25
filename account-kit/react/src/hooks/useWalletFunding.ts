"use client";

import { useCallback } from "react";
import { useBundlerClient } from "./useBundlerClient.js";

// Types for wallet funding methods
export type FundingDefaults = {
  countryCode: string;
  defaultFiatCurrencyCode: string;
  defaultPaymentMethodType: string;
  provider: string;
};

export type FundingQuote = {
  provider: string;
  paymentMethodType: string;
  destinationAmount: string;
  destinationCurrencyCode: string;
  fees: {
    network?: string;
    provider?: string;
  };
  total: {
    sourceAmount: string;
    sourceCurrencyCode: string;
  };
  estimatedArrival: string;
  quoteExpiresAt: string;
  route: {
    hops: string[];
  };
};

export type FundingQuotes = {
  quotes: FundingQuote[];
  rankBy: string;
};

export type FundingLimits = {
  countryCode: string;
  fiatCurrencyCode: string;
  limits: {
    min: string;
    max: string;
    default: string;
  };
  context: {
    paymentMethodType: string;
    provider: string;
  };
};

export type FundingSession = {
  sessionId: string;
  widgetUrl: string;
  expiresAt: string;
};

export type PaymentMethod = {
  type: string;
  label: string;
};

export type FiatCurrency = {
  code: string;
  name: string;
};

/**
 * Hook for interacting with wallet funding/onramp functionality
 *
 * @returns {object} Wallet funding methods
 */
export const useWalletFunding = () => {
  const bundlerClient = useBundlerClient();

  const makeWalletRequest = useCallback(
    async <T>(method: string, params: any[]): Promise<T> => {
      if (!bundlerClient) {
        throw new Error("Bundler client not available");
      }

      try {
        const result = await bundlerClient.request({
          method,
          params,
        } as any);
        return result as T;
      } catch (error) {
        console.error(`Wallet funding request failed for ${method}:`, error);
        throw error;
      }
    },
    [bundlerClient],
  );

  const getDefaults = useCallback(
    async ({
      countryCode,
      serviceProvider,
    }: {
      countryCode: string;
      serviceProvider?: string;
    }): Promise<FundingDefaults | null> => {
      return makeWalletRequest("wallet_fundingGetDefaults", [
        {
          countryCode,
          serviceProvider,
        },
      ]);
    },
    [makeWalletRequest],
  );

  const getQuote = useCallback(
    async ({
      countryCode,
      destinationCurrencyCode,
      walletAddress,
      sourceAmount,
      sourceCurrencyCode,
      paymentMethodType,
      serviceProvider,
      rankBy = "price",
    }: {
      countryCode: string;
      destinationCurrencyCode: string;
      walletAddress?: string;
      sourceAmount: string;
      sourceCurrencyCode: string;
      paymentMethodType: string;
      serviceProvider?: string;
      rankBy?: string;
    }): Promise<FundingQuotes | null> => {
      return makeWalletRequest("wallet_fundingGetQuote", [
        {
          countryCode,
          destinationCurrencyCode,
          walletAddress,
          sourceAmount,
          sourceCurrencyCode,
          paymentMethodType,
          serviceProvider,
          rankBy,
        },
      ]);
    },
    [makeWalletRequest],
  );

  const createSession = useCallback(
    async ({
      countryCode,
      destinationCurrencyCode,
      walletAddress,
      sourceAmount,
      sourceCurrencyCode,
      paymentMethodType,
      serviceProvider,
    }: {
      countryCode: string;
      destinationCurrencyCode: string;
      walletAddress: string;
      sourceAmount: string;
      sourceCurrencyCode: string;
      paymentMethodType: string;
      serviceProvider: string;
    }): Promise<FundingSession | null> => {
      return makeWalletRequest("wallet_fundCreateSession", [
        {
          countryCode,
          destinationCurrencyCode,
          walletAddress,
          sourceAmount,
          sourceCurrencyCode,
          paymentMethodType,
          serviceProvider,
        },
      ]);
    },
    [makeWalletRequest],
  );

  const getLimits = useCallback(
    async ({
      countryCode,
      fiatCurrencyCode,
      paymentMethodType,
      serviceProvider,
    }: {
      countryCode: string;
      fiatCurrencyCode: string;
      paymentMethodType: string;
      serviceProvider?: string;
    }): Promise<FundingLimits | null> => {
      return makeWalletRequest("wallet_fundingGetLimits", [
        {
          countryCode,
          fiatCurrencyCode,
          paymentMethodType,
          serviceProvider,
        },
      ]);
    },
    [makeWalletRequest],
  );

  const listPaymentMethods = useCallback(
    async ({
      countryCode,
      fiatCurrencyCode,
      serviceProvider,
    }: {
      countryCode: string;
      fiatCurrencyCode: string;
      serviceProvider?: string;
    }): Promise<{
      paymentMethods: PaymentMethod[];
      countryCode: string;
      provider: string;
    } | null> => {
      return makeWalletRequest("wallet_fundingListPaymentMethods", [
        {
          countryCode,
          fiatCurrencyCode,
          serviceProvider,
        },
      ]);
    },
    [makeWalletRequest],
  );

  const listFiatCurrencies = useCallback(
    async ({
      countryCode,
      serviceProvider,
    }: {
      countryCode: string;
      serviceProvider?: string;
    }): Promise<{
      fiatCurrencies: FiatCurrency[];
      countryCode: string;
      provider: string;
    } | null> => {
      return makeWalletRequest("wallet_fundingListFiatCurrencies", [
        {
          countryCode,
          serviceProvider,
        },
      ]);
    },
    [makeWalletRequest],
  );

  return {
    getDefaults,
    getQuote,
    createSession,
    getLimits,
    listPaymentMethods,
    listFiatCurrencies,
  };
};

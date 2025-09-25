type ProviderInfo = {
  id: string;
  name: string;
  icon: string;
  processingTime: string;
  exchangeRate: string;
  fee: string;
  feeDescription: string;
  bestPrice?: boolean;
  fastest?: boolean;
};

export const providerData: Record<string, ProviderInfo> = {
  transak: {
    id: "transak",
    name: "Transak",
    icon: "💎",
    processingTime: "~4 minutes",
    exchangeRate: "1.01",
    fee: "$2.50",
    feeDescription: "2.5% processing fee",
  },
  kraken: {
    id: "kraken",
    name: "Kraken",
    icon: "🐙",
    processingTime: "~2 minutes",
    exchangeRate: "1.00",
    fee: "$1.00",
    feeDescription: "1% processing fee",
    bestPrice: true,
  },
  coinbase: {
    id: "coinbase",
    name: "Coinbase",
    icon: "🪙",
    processingTime: "~30 seconds",
    exchangeRate: "1.01",
    fee: "$0",
    feeDescription: "No fees for USDC on Coinbase",
    fastest: true,
  },
  moonpay: {
    id: "moonpay",
    name: "Moonpay",
    icon: "🌙",
    processingTime: "~4 minutes",
    exchangeRate: "1.01",
    fee: "$2.00",
    feeDescription: "2% processing fee",
  },
};

export type ProviderId = keyof typeof providerData;

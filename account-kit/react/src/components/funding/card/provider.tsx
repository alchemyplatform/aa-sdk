import { ChevronRight } from "lucide-react";

type FundingProviderProps = {
  provider: string;
  exchangeRate: string;
  token: string;
  fees: {
    network?: string;
    provider?: string;
  };
  processingTime: string;
  isLoading?: boolean;
};

// Provider logos/names mapping
const providerInfo: Record<string, { name: string; logo?: string }> = {
  coinbase: { name: "Coinbase" },
  banxa: { name: "Banxa" },
  moonpay: { name: "MoonPay" },
  // Add more providers as needed
};

export const FundingProvider = ({
  provider,
  token,
  fees,
  processingTime,
  isLoading = false,
}: FundingProviderProps) => {
  const providerName = providerInfo[provider]?.name || provider;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Best provider</h3>
        <div className="p-4 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Best provider</h3>
        <span className="text-xs text-blue-600">Quotes locked for [90s]</span>
      </div>

      <div className="p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {providerName.charAt(0)}
              </span>
            </div>
            <span className="font-medium">{providerName}</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 text-sm">
            Compare providers
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <div>Exchange rate: $1.01 = 1 {token}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <h4 className="font-medium text-gray-700">Processing & Fees</h4>
        <div className="space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>Fee</span>
            <span>
              {fees.network || fees.provider
                ? `$${(
                    parseFloat(fees.network || "0") +
                    parseFloat(fees.provider || "0")
                  ).toFixed(2)}`
                : "No fees for " + token + " on " + providerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Average processing time</span>
            <span>{processingTime || "~30 seconds"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

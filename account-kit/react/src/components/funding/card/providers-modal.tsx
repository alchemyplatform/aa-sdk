import { X } from "../../../icons/x.js";
import { providerData } from "./provider-data.js";
import type { Quote } from "../../../hooks/internal/walletFundingTypes.js";

type ProvidersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  quotes: Quote[];
  selectedQuoteId: string;
  onSelectQuote: (quoteId: string) => void;
  amount: string;
  token: string;
};

export const ProvidersModal = ({
  isOpen,
  onClose,
  quotes,
  selectedQuoteId,
  onSelectQuote,
  amount,
  token,
}: ProvidersModalProps) => {
  if (!isOpen) return null;

  // Format eta to display string
  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `~${seconds} seconds`;
    if (seconds < 3600) return `~${Math.round(seconds / 60)} minutes`;
    return `~${Math.round(seconds / 3600)} hours`;
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold flex-1 text-center">Providers</h3>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 text-center mb-6">
            Select your preferred provider to pay through. Identity verification
            may be required.
          </p>

          <div className="text-sm text-gray-600 text-center">
            Quotes locked for{" "}
            <span className="text-blue-600 font-medium">[90s]</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Provider</h4>

            {quotes.map((quote) => {
              const isSelected = selectedQuoteId === quote.quoteId;
              const provider = providerData[quote.providerId];

              return (
                <button
                  key={quote.quoteId}
                  onClick={() => {
                    onSelectQuote(quote.quoteId);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider?.icon || "💱"}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {provider?.name || quote.providerId}
                        </span>
                        {quote.badges?.includes("best_price") && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Best price
                          </span>
                        )}
                        {quote.badges?.includes("fastest") && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Fastest
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${amount || "0"} = {quote.destinationAmount} {token}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatEta(quote.etaSeconds)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pb-6 flex items-center justify-center text-xs text-gray-500">
            <span>protected by</span>
            <span className="ml-1 flex items-center">⚡ alchemy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

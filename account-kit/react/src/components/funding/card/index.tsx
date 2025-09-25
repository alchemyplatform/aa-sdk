import { useCallback, useState, useEffect, useMemo } from "react";
import { FundingCardHeader } from "./header.js";
import { PaymentMethodsModal } from "./payment-methods-modal.js";
import { ProvidersModal } from "./providers-modal.js";
import { providerData } from "./provider-data.js";
import { getPaymentMethodById } from "./payment-method-data.js";
import { useFundingContext } from "../context.js";
import { useWalletFunding } from "../../../hooks/useWalletFunding.js";
import { useFundingModal } from "../../../hooks/useFundingModal.js";
import { useAccount } from "../../../hooks/useAccount.js";
import { ChevronRight } from "../../../icons/chevronRight.js";
import { Info } from "../../../icons/info.js";
import type { PaymentMethod } from "../../../hooks/internal/walletFundingTypes.js";

type FundingCardProps = {
  showClose?: boolean;
};

export const FundingCard = ({ showClose = false }: FundingCardProps) => {
  const { token } = useFundingContext();
  const [amount, setAmount] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("DEBIT_CARD");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [quoteLockSeconds, setQuoteLockSeconds] = useState<number>(90);
  const [fiatCurrency, setFiatCurrency] = useState<string>("USD");
  // TODO: Use these for input validation
  const [minAmount, setMinAmount] = useState<string>("10");
  const [maxAmount, setMaxAmount] = useState<string>("10000");

  // Suppress unused warnings - these will be used for validation
  void minAmount;
  void maxAmount;

  const { getConfig, getQuotes, createSession, quotesCache, isLoading } =
    useWalletFunding();
  const { closeFundingModal } = useFundingModal();
  const { address } = useAccount({ type: "LightAccount" });

  // Preset amounts
  const presetAmounts = ["25", "50", "100"];

  // Find the currently selected quote
  const selectedQuote = useMemo(() => {
    if (!quotesCache || quotesCache.length === 0) return null;
    return (
      quotesCache.find((q) => q.quoteId === selectedQuoteId) || quotesCache[0]
    );
  }, [quotesCache, selectedQuoteId]);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getConfig({ countryCode: "US" });
        if (config) {
          // Set defaults from config
          setFiatCurrency(config.defaults.fiat);
          setSelectedPaymentMethod(config.defaults.paymentMethod);
          setQuoteLockSeconds(config.ui.quoteLockSeconds);

          // Find limits for the default payment method
          const limits = config.limits.find(
            (l) =>
              l.fiat === config.defaults.fiat &&
              l.paymentMethod === config.defaults.paymentMethod,
          );
          if (limits) {
            setAmount(limits.default);
            setMinAmount(limits.min);
            setMaxAmount(limits.max);
          }
        }
      } catch (error) {
        console.error("Failed to load config:", error);
      }
    };

    loadConfig();
  }, [getConfig]);

  // Fetch quotes when amount or payment method changes
  useEffect(() => {
    if (!amount || !selectedPaymentMethod || !token) return;

    const fetchQuotes = async () => {
      try {
        const response = await getQuotes({
          countryCode: "US",
          token,
          amount,
          fiat: fiatCurrency,
          paymentMethod: selectedPaymentMethod,
          walletAddress: address,
        });

        if (response && response.quotes.length > 0) {
          // Select the first quote (best ranked)
          setSelectedQuoteId(response.quotes[0].quoteId);
        }
      } catch (error) {
        console.error("Failed to fetch quotes:", error);
      }
    };

    const debounceTimer = setTimeout(fetchQuotes, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, selectedPaymentMethod, token, fiatCurrency, address, getQuotes]);

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const handlePresetClick = useCallback((presetAmount: string) => {
    setAmount(presetAmount);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedQuoteId || !selectedQuote) return;

    try {
      const session = await createSession({
        quoteId: selectedQuoteId,
      });

      if (session?.widgetUrl) {
        // Open the provider's widget in a new window
        window.open(session.widgetUrl, "_blank", "width=600,height=800");

        // Close the funding modal
        closeFundingModal();
      }
    } catch (error: any) {
      console.error("Failed to create funding session:", error);

      // Handle quote expired error
      if (error.message?.includes("expired")) {
        // Refresh quotes
        const response = await getQuotes({
          countryCode: "US",
          token,
          amount,
          fiat: fiatCurrency,
          paymentMethod: selectedPaymentMethod,
          walletAddress: address,
        });

        if (response && response.quotes.length > 0) {
          setSelectedQuoteId(response.quotes[0].quoteId);
          alert("Quote expired. Please try again with the refreshed quote.");
        }
      } else {
        // For demo purposes when no app ID is configured
        alert(
          `Demo: You would be redirected to ${selectedQuote.providerId} to complete purchasing ${amount} USD worth of ${token}.`,
        );
        closeFundingModal();
      }
    }
  }, [
    selectedQuoteId,
    selectedQuote,
    amount,
    token,
    fiatCurrency,
    selectedPaymentMethod,
    address,
    createSession,
    getQuotes,
    closeFundingModal,
  ]);

  // Format numbers with commas
  const formatNumber = (num: string) => {
    const parts = num.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Get display values from selected quote
  const displayConverted = selectedQuote?.destinationAmount
    ? formatNumber(selectedQuote.destinationAmount)
    : "0";

  // Format eta to display string
  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `~${seconds} seconds`;
    if (seconds < 3600) return `~${Math.round(seconds / 60)} minutes`;
    return `~${Math.round(seconds / 3600)} hours`;
  };

  return (
    <div className="flex flex-col relative h-full w-full">
      <FundingCardHeader showClose={showClose} token={token} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-5">
          {/* Amount Input */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    handleAmountChange(value);
                  }
                }}
                placeholder="0"
                className="text-4xl font-semibold bg-transparent text-center w-32 outline-none"
              />
              <span className="text-2xl text-gray-500">{fiatCurrency}</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <span>≈</span>
              <span>
                {isLoading ? "..." : displayConverted} {token}
              </span>
              <Info className="w-3 h-3 ml-1 text-blue-500" />
            </div>
          </div>

          {/* Preset Amount Buttons */}
          <div className="flex gap-3 justify-center">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`px-6 py-2 rounded-lg border transition-all ${
                  amount === preset
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Pay With Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Pay with</h3>
            <button
              onClick={() => setShowPaymentMethods(true)}
              className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const method = getPaymentMethodById(selectedPaymentMethod);
                  if (!method) return null;
                  const Icon = method.icon;
                  return (
                    <>
                      {typeof Icon === "string" ? (
                        <span className="text-xl">{Icon}</span>
                      ) : (
                        <Icon className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="font-medium">{method.displayName}</span>
                      {method.recommended && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Recommended
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Best Provider Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Best provider
              <button
                onClick={() => setShowProviders(true)}
                className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-normal"
              >
                Compare providers →
              </button>
              {quotesCache && quotesCache.length > 0 && (
                <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Quotes locked for {quoteLockSeconds}s
                </span>
              )}
            </h3>
            <div className="p-4 rounded-lg border border-gray-200">
              {selectedQuote ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {providerData[selectedQuote.providerId]?.icon || "💱"}
                      </span>
                      <span className="font-medium">
                        {providerData[selectedQuote.providerId]?.name ||
                          selectedQuote.providerId}
                      </span>
                      {selectedQuote.badges?.includes("fastest") && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Fastest
                        </span>
                      )}
                      {selectedQuote.badges?.includes("best_price") && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Best price
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      ${selectedQuote.exchangeRate} = 1 {token}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Processing & Fees</span>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">Fee</span>
                        <span>
                          {selectedQuote.fees.total === "0"
                            ? "No fees"
                            : `$${selectedQuote.fees.total}`}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">
                          Average processing time
                        </span>
                        <span>{formatEta(selectedQuote.etaSeconds)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  {isLoading
                    ? "Loading quotes..."
                    : "Enter an amount to see providers"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button
          onClick={handleContinue}
          disabled={!amount || !selectedQuote || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !amount || !selectedQuote || isLoading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading ? "Loading..." : "Continue"}
        </button>

        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
          <span>protected by</span>
          <span className="flex items-center">⚡ alchemy</span>
        </div>
      </div>

      {/* Modals */}
      <PaymentMethodsModal
        isOpen={showPaymentMethods}
        onClose={() => setShowPaymentMethods(false)}
        selectedMethod={selectedPaymentMethod}
        onSelectMethod={(method) =>
          setSelectedPaymentMethod(method as PaymentMethod)
        }
      />

      <ProvidersModal
        isOpen={showProviders}
        onClose={() => setShowProviders(false)}
        quotes={quotesCache || []}
        selectedQuoteId={selectedQuoteId}
        onSelectQuote={setSelectedQuoteId}
        amount={amount}
        token={token}
      />
    </div>
  );
};

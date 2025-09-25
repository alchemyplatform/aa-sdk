import { useCallback, useState, useEffect } from "react";
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

type FundingCardProps = {
  showClose?: boolean;
};

export const FundingCard = ({ showClose = false }: FundingCardProps) => {
  const { token } = useFundingContext();
  const [amount, setAmount] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [, setExchangeRate] = useState<string>("");
  const [, setFees] = useState<{ network?: string; provider?: string }>({});
  const [, setProcessingTime] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<string>("");
  const [, setIsLoadingQuote] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  const { getDefaults, getQuote, getLimits, createSession } =
    useWalletFunding();
  const { closeFundingModal } = useFundingModal();
  const { address } = useAccount({ type: "LightAccount" });

  // Preset amounts
  const presetAmounts = ["25", "50", "100"];

  // Load defaults on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await getDefaults({ countryCode: "US" });
        if (defaults) {
          setSelectedPaymentMethod(defaults.defaultPaymentMethodType);
        }

        // Get limits to set default amount
        const limits = await getLimits({
          countryCode: "US",
          fiatCurrencyCode: "USD",
          paymentMethodType: defaults?.defaultPaymentMethodType || "CARD",
        });
        if (limits && limits.limits.default) {
          setAmount(limits.limits.default);
        }
      } catch (error) {
        console.error("Failed to load defaults:", error);
        // Mock defaults for demo
        setSelectedPaymentMethod("CARD");
        setAmount("50");
        setSelectedProvider("coinbase");
        setConvertedAmount("50");
        setExchangeRate("1.01");
        setFees({ network: "0", provider: "0" });
        setProcessingTime("~30 seconds");
      }
    };

    loadDefaults();
  }, [getDefaults, getLimits]);

  // Fetch quote when amount or payment method changes
  useEffect(() => {
    if (!amount || !selectedPaymentMethod || !token) return;

    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      try {
        const quote = await getQuote({
          countryCode: "US",
          destinationCurrencyCode: token,
          sourceAmount: amount,
          sourceCurrencyCode: "USD",
          paymentMethodType: selectedPaymentMethod,
          rankBy: "price",
        });

        if (quote && quote.quotes.length > 0) {
          const bestQuote = quote.quotes[0];
          setSelectedProvider(bestQuote.provider);
          setConvertedAmount(bestQuote.destinationAmount);
          setFees({
            network: bestQuote.fees?.network,
            provider: bestQuote.fees?.provider,
          });

          // Calculate exchange rate
          const rate =
            parseFloat(amount) / parseFloat(bestQuote.destinationAmount);
          setExchangeRate(rate.toFixed(4));

          // Parse estimated arrival time
          const estimatedArrival = bestQuote.estimatedArrival;
          if (estimatedArrival) {
            // Parse ISO 8601 duration (e.g., "PT5M" = 5 minutes)
            const match = estimatedArrival.match(/PT(\d+)([MHS])/);
            if (match) {
              const value = match[1];
              const unit = match[2];
              const unitMap: Record<string, string> = {
                S: "seconds",
                M: "minutes",
                H: "hours",
              };
              setProcessingTime(`~${value} ${unitMap[unit] || unit}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        // Mock quote data for demo
        const mockConvertedAmount = (parseFloat(amount) * 0.999).toFixed(2);
        setConvertedAmount(mockConvertedAmount);
        setSelectedProvider("coinbase");
        setExchangeRate("1.01");
        setFees({ network: "0", provider: "0" });
        setProcessingTime("~30 seconds");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounceTimer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, selectedPaymentMethod, token, getQuote]);

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const handlePresetClick = useCallback((presetAmount: string) => {
    setAmount(presetAmount);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!amount || !selectedProvider || !selectedPaymentMethod) return;

    if (!address) {
      console.error("No wallet address available");
      return;
    }

    try {
      const session = await createSession({
        countryCode: "US",
        destinationCurrencyCode: token,
        walletAddress: address,
        sourceAmount: amount,
        sourceCurrencyCode: "USD",
        paymentMethodType: selectedPaymentMethod,
        serviceProvider: selectedProvider,
      });

      if (session?.widgetUrl) {
        // Open the provider's widget in a new window
        window.open(session.widgetUrl, "_blank", "width=600,height=800");

        // Close the funding modal
        closeFundingModal();
      }
    } catch (error) {
      console.error("Failed to create funding session:", error);
      // For demo purposes, show success message
      alert(
        `Demo: You would be redirected to ${selectedProvider === "coinbase" ? "Coinbase" : selectedProvider} to complete purchasing ${amount} USD worth of ${token}.`,
      );
      closeFundingModal();
    }
  }, [
    amount,
    token,
    selectedProvider,
    selectedPaymentMethod,
    address,
    createSession,
    closeFundingModal,
  ]);

  // Format numbers with commas
  const formatNumber = (num: string) => {
    const parts = num.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Get display values
  const displayConverted = convertedAmount
    ? formatNumber(convertedAmount)
    : "0";

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
              <span className="text-2xl text-gray-500">USD</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <span>≈</span>
              <span>
                {displayConverted} {token}
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
            </h3>
            <div className="p-4 rounded-lg border border-gray-200">
              {selectedProvider &&
              providerData[selectedProvider as keyof typeof providerData] ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {
                          providerData[
                            selectedProvider as keyof typeof providerData
                          ].icon
                        }
                      </span>
                      <span className="font-medium">
                        {
                          providerData[
                            selectedProvider as keyof typeof providerData
                          ].name
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      $
                      {
                        providerData[
                          selectedProvider as keyof typeof providerData
                        ].exchangeRate
                      }{" "}
                      = 1 {token}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Processing & Fees</span>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">Fee</span>
                        <span>
                          {
                            providerData[
                              selectedProvider as keyof typeof providerData
                            ].feeDescription
                          }
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">
                          Average processing time
                        </span>
                        <span>
                          {
                            providerData[
                              selectedProvider as keyof typeof providerData
                            ].processingTime
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  Loading provider details...
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
          disabled={!amount || !selectedProvider}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !amount || !selectedProvider
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Continue
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
        onSelectMethod={setSelectedPaymentMethod}
      />

      <ProvidersModal
        isOpen={showProviders}
        onClose={() => setShowProviders(false)}
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        amount={amount}
        convertedAmount={convertedAmount}
        token={token}
      />
    </div>
  );
};

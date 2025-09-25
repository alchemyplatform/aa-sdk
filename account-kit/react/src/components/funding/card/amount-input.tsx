import { useCallback, type ChangeEvent } from "react";

type FundingAmountInputProps = {
  amount: string;
  convertedAmount: string;
  token: string;
  onChange: (amount: string) => void;
  onPresetClick: (amount: string) => void;
  presetAmounts: string[];
  isLoadingQuote?: boolean;
};

export const FundingAmountInput = ({
  amount,
  convertedAmount,
  token,
  onChange,
  onPresetClick,
  presetAmounts,
  isLoadingQuote = false,
}: FundingAmountInputProps) => {
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Only allow numbers and decimals
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        onChange(value);
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={handleInputChange}
          placeholder="0"
          className="w-full text-4xl font-semibold bg-transparent border-none outline-none text-center"
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl font-medium text-gray-600">
          USD
        </div>
      </div>

      {convertedAmount && (
        <div className="text-center text-sm text-gray-500">
          {isLoadingQuote ? (
            <span className="animate-pulse">Calculating...</span>
          ) : (
            <>
              ≈ {convertedAmount} {token}
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => onPresetClick(preset)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              amount === preset
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  );
};

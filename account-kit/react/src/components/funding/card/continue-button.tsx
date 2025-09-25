import { Shield } from "lucide-react";

type FundingContinueButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const FundingContinueButton = ({
  onClick,
  disabled = false,
}: FundingContinueButtonProps) => {
  return (
    <div className="p-6 pt-0 space-y-3">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        Continue
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>protected by</span>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>alchemy</span>
        </div>
      </div>
    </div>
  );
};

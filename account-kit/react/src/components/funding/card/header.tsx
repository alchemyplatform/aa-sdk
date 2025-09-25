import { X } from "lucide-react";
import { useFundingModal } from "../../../hooks/useFundingModal.js";

type FundingCardHeaderProps = {
  showClose?: boolean;
  token: string;
};

export const FundingCardHeader = ({
  showClose = false,
  token,
}: FundingCardHeaderProps) => {
  const { closeFundingModal } = useFundingModal();

  return (
    <div className="flex items-center justify-between p-6 pb-0">
      <h2 className="text-lg font-semibold">Purchase {token}</h2>
      {showClose && (
        <button
          onClick={closeFundingModal}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

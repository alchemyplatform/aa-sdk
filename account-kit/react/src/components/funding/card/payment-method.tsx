import { CreditCard, Building2 } from "lucide-react";

type FundingPaymentMethodProps = {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
};

const paymentMethods = [
  {
    type: "CARD",
    label: "Debit card",
    icon: CreditCard,
    recommended: true,
  },
  {
    type: "BANK_TRANSFER",
    label: "Bank transfer",
    icon: Building2,
    recommended: false,
  },
];

export const FundingPaymentMethod = ({
  selectedMethod,
  onMethodChange,
}: FundingPaymentMethodProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Pay with</h3>
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <button
            key={method.type}
            onClick={() => onMethodChange(method.type)}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
              selectedMethod === method.type
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <method.icon className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{method.label}</span>
              {method.recommended && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 ${
                selectedMethod === method.type
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300"
              }`}
            >
              {selectedMethod === method.type && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

import { X } from "../../../icons/x.js";
import { paymentMethodData } from "./payment-method-data.js";

type PaymentMethodsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
};

export const PaymentMethodsModal = ({
  isOpen,
  onClose,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold flex-1 text-center">
          Payment Methods
        </h3>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 text-center mb-6">
            Processed securely by our licensed partners. Identity verification
            may be required.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Pay with</h4>

            {paymentMethodData.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => {
                    onSelectMethod(method.id);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {typeof Icon === "string" ? (
                      <span className="text-xl">{Icon}</span>
                    ) : (
                      <Icon className="w-5 h-5 text-gray-600" />
                    )}
                    <span className="font-medium">{method.name}</span>
                    {method.recommended && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Recommended
                      </span>
                    )}
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

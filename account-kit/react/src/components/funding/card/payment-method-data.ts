import { CreditCard } from "../../../icons/creditCard.js";
import { Building2 } from "../../../icons/building2.js";

export const paymentMethodData = [
  {
    id: "APPLE_PAY",
    name: "Apple Pay",
    displayName: "Apple Pay",
    icon: "🍎",
    recommended: false,
  },
  {
    id: "DEBIT_CARD",
    name: "Debit Card",
    displayName: "Debit card",
    icon: CreditCard,
    recommended: true,
  },
  {
    id: "BANK_TRANSFER",
    name: "Bank transfer",
    displayName: "Bank transfer",
    icon: Building2,
    recommended: false,
  },
] as const;

export const getPaymentMethodById = (id: string) => {
  return paymentMethodData.find((method) => method.id === id);
};

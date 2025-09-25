import { type ReactNode } from "react";
import { FundingModal } from "./modal.js";
import { FundingProvider as FundingContextProvider } from "./context.js";
import { FundingEventListener } from "./event-listener.js";
import { useFundingModal } from "../../hooks/useFundingModal.js";

type FundingProviderProps = {
  children: ReactNode;
};

export const FundingProvider = ({ children }: FundingProviderProps) => {
  const { isOpen, token, network } = useFundingModal();

  return (
    <>
      <FundingEventListener />
      {children}
      {isOpen && (
        <FundingContextProvider
          token={token || "USDC"}
          network={network || "ethereum"}
        >
          <FundingModal />
        </FundingContextProvider>
      )}
    </>
  );
};

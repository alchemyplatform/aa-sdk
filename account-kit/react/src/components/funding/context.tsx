import { createContext, useContext, type ReactNode } from "react";

type FundingContextValue = {
  token: string;
  network: string;
  walletAddress?: string;
};

const FundingContext = createContext<FundingContextValue | undefined>(
  undefined,
);

type FundingProviderProps = {
  children: ReactNode;
  token: string;
  network: string;
  walletAddress?: string;
};

export const FundingProvider = ({
  children,
  token,
  network,
  walletAddress,
}: FundingProviderProps) => {
  return (
    <FundingContext.Provider value={{ token, network, walletAddress }}>
      {children}
    </FundingContext.Provider>
  );
};

export const useFundingContext = () => {
  const context = useContext(FundingContext);
  if (!context) {
    throw new Error("useFundingContext must be used within a FundingProvider");
  }
  return context;
};

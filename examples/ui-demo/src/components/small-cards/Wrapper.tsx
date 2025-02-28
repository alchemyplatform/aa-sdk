import { useSigner } from "@account-kit/react";
import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { MintCard7702, MintCardDefault } from "./MintCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { MFACard } from "./MFACard";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();
  const signer = useSigner();

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {walletType === WalletTypes.smart ? (
        <>
          <MintCardDefault />
          <TransactionsCardDefault />
          <MFACard />
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            onClick={async () => {
              try {
                const factors = await signer?.inner.getMfaFactors();
                console.log("MFA Factors:", factors);
              } catch (error) {
                console.error("Error fetching MFA factors:", error);
              }
            }}
          >
            List MFA Factors
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={async () => {
              try {
                const factors = await signer?.inner.getMfaFactors();
                const factorId = factors?.multiFactors?.[0]?.multiFactorId;
                if (!factorId) {
                  console.error("No MFA factor ID found");
                  return;
                }
                const result = await signer?.inner.removeMfa({
                  multiFactorIds: [factorId],
                });
                console.log(result);
                setFactorId("");
              } catch (error) {
                console.error("Error removing MFA factor:", error);
              }
            }}
          >
            Remove MFA
          </button>
        </>
      ) : (
        <>
          <MintCard7702 />
          <TransactionsCard7702 />
          <MFACard />
        </>
      )}
    </div>
  );
};

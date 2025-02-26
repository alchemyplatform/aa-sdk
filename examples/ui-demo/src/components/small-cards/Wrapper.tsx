import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { MintCard7702, MintCardDefault } from "./MintCard";
import { useModularAccountV2Client } from "../../hooks/useModularAccountV2Client";
import { arbitrumSepolia } from "viem/chains";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { useSigner } from "@account-kit/react";
import { alchemy } from "@account-kit/infra";
import { useState } from "react";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();
  const signer = useSigner();
  const [factorId, setFactorId] = useState("");

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {walletType === WalletTypes.smart ? (
        <>
          <MintCardDefault />
          <TransactionsCardDefault />
          <div className="flex flex-col gap-4 mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={async () => {
                const user = await signer?.inner.addMfa({
                  factorType: "totp",
                });
                console.log(user);
              }}
            >
              Add MFA
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={async () => {
                const factorId = document.getElementById(
                  "mfa-factor-id"
                ) as HTMLInputElement;
                if (!factorId || !factorId.value) {
                  console.error("Please enter a factor ID to remove");
                  return;
                }

                try {
                  const user = await signer?.inner.removeMfa({
                    factors: [factorId.value],
                  });
                  console.log(user);
                  factorId.value = ""; // Clear the input after successful removal
                } catch (error) {
                  console.error("Error removing MFA factor:", error);
                }
              }}
            >
              Remove MFA
            </button>
            <div className="mt-3">
              <label
                htmlFor="mfa-factor-id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Factor ID to remove:
              </label>
              <input
                type="text"
                id="mfa-factor-id"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full"
                placeholder="Enter factor ID"
              />
            </div>
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
          </div>
        </>
      ) : (
        <>
          <MintCard7702 />
          <TransactionsCard7702 />
        </>
      )}
    </div>
  );
};

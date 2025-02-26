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
import { QRCodeSVG } from "qrcode.react";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();
  const signer = useSigner();
  const [factorId, setFactorId] = useState("");
  const [totpUrl, setTotpUrl] = useState("");
  const [newFactorId, setNewFactorId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {walletType === WalletTypes.smart ? (
        <>
          <MintCardDefault />
          <TransactionsCardDefault />
          <div className="flex flex-col gap-4 mt-4">
            {totpUrl && (
              <div className="mb-6 p-4 border rounded-lg bg-white flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG value={totpUrl} size={200} />
                </div>
                <button
                  className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  onClick={() => setTotpUrl("")}
                >
                  Dismiss
                </button>
                <div className="mt-4 w-full">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <button
                    className="mt-2 w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    onClick={async () => {
                      try {
                        if (!newFactorId || !verificationCode) {
                          console.error(
                            "Missing factor ID or verification code"
                          );
                          return;
                        }

                        await signer?.inner.verifyMfa({
                          multiFactorId: newFactorId,
                          multiFactorCode: verificationCode,
                        });

                        console.log("MFA verification successful");
                        setTotpUrl("");
                        setVerificationCode("");

                        // Refresh the list of MFA factors
                        const factors = await signer?.inner.getMfaFactors();
                        console.log("Updated MFA Factors:", factors);
                      } catch (error) {
                        console.error("Error verifying MFA:", error);
                      }
                    }}
                  >
                    Verify Code
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={async () => {
                  try {
                    const result = await signer?.inner.addMfa({
                      multiFactorType: "totp",
                    });
                    console.log(result);

                    // Check if the result contains a TOTP URL and set it to state
                    if (result?.multiFactorTotpUrl) {
                      setTotpUrl(result.multiFactorTotpUrl);
                      setNewFactorId(result.multiFactorId);
                    }
                  } catch (error) {
                    console.error("Error adding MFA:", error);
                  }
                }}
              >
                Add MFA
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={async () => {
                  if (!factorId) {
                    console.error("Please enter a factor ID to remove");
                    return;
                  }

                  try {
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
                value={factorId}
                onChange={(e) => setFactorId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full"
                placeholder="Enter factor ID"
              />
            </div>
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

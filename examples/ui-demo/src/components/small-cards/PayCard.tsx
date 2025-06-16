import { useTokenTransfer } from "@/hooks/useTokenTransfer";
import { useToast } from "@/hooks/useToast";
import { useSigner } from "@account-kit/react";
import { useAccount } from "@account-kit/react";
import { useChain } from "@account-kit/react";
import { alchemy } from "@account-kit/infra";
import { useCallback, useState } from "react";
import { Button } from "./Button";
import { arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import type { AccountMode } from "@/app/config";
import { Card } from "./Card";

export const PayCard = ({ accountMode }: { accountMode: AccountMode }) => {
  const { setToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const signer = useSigner();
  console.log("****PayCard signer:", signer);
  const { address } = useAccount({
    type: "ModularAccountV2",
    accountParams: {
      mode: "7702",
    },
  });
  console.log("****PayCard address:", address);
  const { chain } = useChain();
  console.log("****PayCard chain:", chain);

  const { transfer, isTransferring } = useTokenTransfer({
    amount: 1,
    recipient: "0x04aB0ce6b0a311EeFb6165CFde46e3069953Ec24",
    signer: signer!,
    clientOptions: {
      mode: accountMode === "7702" ? "7702" : "default",
      chain: accountMode === "7702" ? baseSepolia : arbitrumSepolia,
      transport: alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
      }),
    },
  });

  const handleTransfer = useCallback(async () => {
    if (!signer) {
      setToast({
        type: "error",
        open: true,
        text: "Please connect your wallet first",
      });
      return;
    }

    setIsLoading(true);
    try {
      await transfer();
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [signer, transfer, setToast]);

  const isLoadingClient = isLoading || isTransferring;
  const buttonText = !isTransferring ? "Pay with One Balance" : "Processing...";

  const renderContent = (
    <p className="text-fg-primary text-sm mb-3">
      Send 1 USDC to bityang.eth using One Balance across chains
    </p>
  );

  const image = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
      <span className="text-2xl font-bold text-white tracking-wider">Pay</span>
    </div>
  );

  return (
    <Card
      imageSlot={image}
      heading="Pay with One Balance"
      content={renderContent}
      buttons={
        <Button
          className="mt-auto"
          onClick={handleTransfer}
          disabled={isLoadingClient || !signer}
        >
          {buttonText}
        </Button>
      }
    />
  );
};

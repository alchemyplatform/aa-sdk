import { useToast } from "@/hooks/useToast";
import {
  useSigner,
  useSignerStatus,
  useSolanaTransaction,
  useSolanaSignMessage,
} from "@account-kit/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Hex } from "viem";
import { LoadingIcon } from "../icons/loading";
import { UserAddressTooltip } from "../user-connection-avatar/UserAddressLink";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";
import { CheckCircleFilledIcon } from "../icons/check-circle-filled";
import { set } from "zod";

type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

export const SolanaNftCard = () => {
  const signer = useSigner();
  const status = useSignerStatus();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const solanaSigner = useMemo(() => {
    if (!signer) return;
    if (!status.isConnected) return;
    return signer.toSolanaSigner();
  }, [signer, status.isConnected]);
  const { setToast } = useToast();

  const imageSlot = (
    <div className="w-full h-full bg-[#DCFCE7] flex justify-center items-center relative">
      <Image
        src="/images/duckImage.png"
        alt="Solana Duck NFT"
        width={300}
        height={300}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );

  const renderTransactionStates = () => {
    const states = [
      {
        state: "signing",
        text: "Signing transaction...",
        isCompleteStates: ["complete", "sponsoring"],
      },
      {
        state: "sponsoring",
        text: "Sponsoring gas & minting NFT...",
        isCompleteStates: ["complete"],
      },
    ];

    return (
      <div className="flex flex-col gap-3">
        {states.map(({ state, text, isCompleteStates }) => {
          const isComplete = isCompleteStates.includes(transactionState);
          return (
            <div key={state} className="flex items-center gap-2">
              {isComplete && (
                <CheckCircleFilledIcon className="h-4 w-4 fill-demo-surface-success" />
              )}
              {!isComplete && <LoadingIcon className="h-4 w-4" />}
              {/* <div className="h-4 w-4" />} */}
              <p className="text-sm text-fg-secondary">{text}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const content = useMemo(
    () => (
      <>
        {transactionState === "idle" ? (
          <>
            <p className="text-fg-primary text-sm mb-3">
              Transact with one click using gas sponsorship and background
              signing.
            </p>
            <div className="flex justify-between items-center">
              <p className="text-fg-secondary text-sm">Gas Fee</p>
              <p>
                <span className="line-through mr-1 text-sm text-fg-primary">
                  $0.02
                </span>
                <span className="text-sm bg-gradient-to-r from-[#FF9C27] to-[#FD48CE] bg-clip-text text-transparent">
                  Free
                </span>
              </p>
            </div>
          </>
        ) : (
          renderTransactionStates()
        )}
      </>
    ),
    [transactionState]
  );

  const handleCollectNFT = async () => {
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    setIsPending(true);
    setTransactionState("signing");
    await wait(1000);
    setTransactionState("sponsoring");
    await wait(1000);
    setTransactionState("complete");
    await wait(1000);
    setIsPending(false);

    // await sendTransaction({
    //   transfer: {
    //     amount: 1000000,
    //     toAddress:
    //       process.env.NEXT_PUBLIC_SOLANA_ADDRESS || solanaSigner.address || "",
    //   },
    // });
  };

  return (
    <Card
      badgeSlot={<Badge text="New!" className="text-[#F3F3FF] bg-[#16A34A]" />}
      imageSlot={imageSlot}
      heading="Solana Gasless Transactions"
      content={content}
      buttons={
        <Button
          className="mt-auto w-full"
          onClick={handleCollectNFT}
          disabled={!solanaSigner || isPending}
        >
          {transactionState === "idle"
            ? "Collect NFT"
            : transactionState === "complete"
            ? "Re-collect NFT"
            : "Collecting NFT..."}
        </Button>
      }
    />
  );
};

import { useToast } from "@/hooks/useToast";
import { useSolanaTransaction } from "@account-kit/react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { LoadingIcon } from "../icons/loading";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";
import { CheckCircleFilledIcon } from "../icons/check-circle-filled";
import { useState } from "react";
import { UserAddressTooltip } from "../user-connection-avatar/UserAddressLink";
import { ExternalLinkIcon } from "lucide-react";
type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

const states = [
  {
    state: "signing",
    text: "Signing transaction...",
    isCompleteStates: ["complete", "sponsoring"],
  },
  {
    state: "sponsoring",
    text: "Sponsoring gas & poking duck (custom program)...",
    isCompleteStates: ["complete"],
  },
];
export const SolanaNftCard = () => {
  const { setToast } = useToast();
  const {
    data: tx,
    sendTransactionAsync,
    isPending,
    connection,
    signer: solanaSigner,
  } = useSolanaTransaction();
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const handleCollectNFT = async () => {
    try {
      if (!solanaSigner) throw new Error("No signer found");
      if (!connection) throw new Error("No connection found");
      setTransactionState("signing");
      setTransactionState("sponsoring");

      const duckProgramId = new PublicKey(
        "duckptkvZCZbnssqEQUSHEkzhL9Gb7mFmsmip3JrNf8"
      );

      // Derive PDA for poke_state
      const [pokeStatePda] = await PublicKey.findProgramAddressSync(
        [Buffer.from("poke_state")],
        duckProgramId
      );
      const instruction = new TransactionInstruction({
        programId: duckProgramId,
        keys: [{ pubkey: pokeStatePda, isSigner: false, isWritable: true }],
        data: Buffer.from(
          // poke discriminator
          [46, 24, 16, 107, 212, 9, 17, 5]
        ),
      });
      const tx = await sendTransactionAsync({
        transactionComponents: {
          // Don't do signing, just use the fee payer? Other signing fails
          preSend: (transaction) => transaction,
        },
        instructions: [instruction],
      });

      console.log(`Created transaction: ${tx.hash} 
      https://explorer.solana.com/tx/${tx.hash}?cluster=devnet 
    `);

      setTransactionState("complete");
    } catch (error) {
      console.log(error);
      setTransactionState("idle");
      setToast({
        type: "error",
        text: "Error sending transaction",
        open: true,
      });
    }
  };

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

  const goToTransaction = tx?.hash && (
    <a
      href={`https://explorer.solana.com/tx/${tx.hash}?cluster=devnet`}
      target="_blank"
      rel="noreferrer"
      aria-label="View transaction"
    >
      <ExternalLinkIcon className="stroke-fg-secondary w-4 h-4" />
    </a>
  );
  const renderTransactionStates = (
    <div className="flex flex-col gap-3">
      {states.map(({ state, text, isCompleteStates }, stateIndex) => {
        const isComplete = isCompleteStates.includes(transactionState);
        return (
          <div key={state} className="flex items-center gap-2">
            {isComplete && (
              <CheckCircleFilledIcon className="h-4 w-4 fill-demo-surface-success" />
            )}
            {!isComplete && <LoadingIcon className="h-4 w-4" />}
            <p className="text-sm text-fg-secondary">
              {text} {stateIndex === states.length - 1 && goToTransaction}
            </p>
          </div>
        );
      })}
    </div>
  );
  const renderIdleContent = (
    <>
      <p className="text-fg-primary text-sm mb-3">
        Transact with one click using gas sponsorship and background signing.
      </p>

      {solanaSigner && (
        <>
          <p className="text-fg-primary text-sm mb-3">
            <span className="font-semibold">Address</span>:{" "}
            <UserAddressTooltip address={solanaSigner.address} />
          </p>
        </>
      )}
      <p className="text-fg-primary text-sm"></p>
      <div className="flex justify-between items-center hidden xl:flex">
        <p className="text-fg-secondary text-base">Gas Fee</p>
        <p>
          <span className="line-through mr-1 text-base text-fg-primary">
            $0.02
          </span>
          <span className="text-base bg-gradient-to-r from-[#FF9C27] to-[#FD48CE] bg-clip-text text-transparent">
            Free
          </span>
        </p>
      </div>
    </>
  );
  const content = (
    <>
      {transactionState === "idle"
        ? renderIdleContent
        : renderTransactionStates}
    </>
  );

  const nextButton = (
    <Button
      className="mt-auto w-full"
      onClick={handleCollectNFT}
      disabled={!solanaSigner || isPending}
    >
      {transactionState === "idle"
        ? "Poke The Duck"
        : transactionState === "complete"
        ? "Re-Poke The Duck"
        : "Poking the Duck..."}
    </Button>
  );

  return (
    <Card
      badgeSlot={<Badge text="New!" className="text-[#F3F3FF] bg-[#16A34A]" />}
      imageSlot={imageSlot}
      heading="Solana Gasless Transactions"
      content={content}
      buttons={nextButton}
    />
  );
};

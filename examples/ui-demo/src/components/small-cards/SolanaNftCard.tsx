import { useToast } from "@/hooks/useToast";
import {
  useSigner,
  useSignerStatus,
  useSolanaConnection,
} from "@account-kit/react";
import {
  Authorized,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  StakeProgram,
  Transaction,
  TransactionConfirmationStrategy,
  TransactionMessage,
} from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LoadingIcon } from "../icons/loading";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";
import { CheckCircleFilledIcon } from "../icons/check-circle-filled";
import bs58 from "bs58";

type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

async function getConfirmationStrategy(
  connection: Connection,
  signature: string
): Promise<TransactionConfirmationStrategy> {
  const latestBlockHash = await connection.getLatestBlockhash();

  return {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  };
}
export const SolanaNftCard = () => {
  const status = useSignerStatus();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const { connection, signer: solanaSigner } = useSolanaConnection();
  const { setToast } = useToast();

  const handleCollectNFT = async () => {
    setIsPending(true);
    try {
      if (!solanaSigner) throw new Error("No signer found");
      if (!connection) throw new Error("No connection found");
      setTransactionState("signing");
      setTransactionState("sponsoring");
      const stakeAccount = Keypair.generate();
      const publicKey = new PublicKey(solanaSigner.address);
      let createStakeAccountInstruction = StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(publicKey, publicKey),
        lamports: LAMPORTS_PER_SOL * 0.02,
      });
      let createStakeAccountTransaction = new Transaction().add(
        createStakeAccountInstruction
      );
      createStakeAccountTransaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      createStakeAccountTransaction.feePayer = publicKey;

      await solanaSigner.addSignature(createStakeAccountTransaction);
      createStakeAccountTransaction.partialSign(stakeAccount);

      const signature =
        "version" in createStakeAccountTransaction ?
          createStakeAccountTransaction.signatures[0]!
        : createStakeAccountTransaction.signature!;

      const confirmationStrategy = await getConfirmationStrategy(
        connection,
        bs58.encode(signature as any)
      );
      const transactionHash = await sendAndConfirmRawTransaction(
        connection,
        Buffer.from(createStakeAccountTransaction.serialize() as any),
        confirmationStrategy,
        { commitment: "confirmed" }
      );

      const votePubkey = new PublicKey(solanaSigner.address);
      let delegateInstruction = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: publicKey,
        votePubkey,
      });

      let delegateTransaction = new Transaction().add(delegateInstruction);
      delegateTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      delegateTransaction.feePayer = publicKey;
      await solanaSigner.addSignature(delegateTransaction);

      const finalTransaction = await sendAndConfirmRawTransaction(
        connection,
        Buffer.from(delegateTransaction.serialize() as any),
        confirmationStrategy,
        { commitment: "confirmed" }
      );

      console.log({ finalTransaction, transactionHash });
      debugger;
      setTransactionState("complete");
    } finally {
      setIsPending(false);
    }

    // await sendTransaction({
    //   transfer: {
    //     amount: 1000000,
    //     toAddress:
    //       process.env.NEXT_PUBLIC_SOLANA_ADDRESS || solanaSigner.address || "",
    //   },
    // });
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
        {transactionState === "idle" ?
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
        : renderTransactionStates()}
      </>
    ),
    [transactionState]
  );

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
          {transactionState === "idle" ?
            "Collect NFT"
          : transactionState === "complete" ?
            "Re-collect NFT"
          : "Collecting NFT..."}
        </Button>
      }
    />
  );
};

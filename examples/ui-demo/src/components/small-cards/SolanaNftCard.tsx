import { useToast } from "@/hooks/useToast";
import {
  useSignerStatus,
  useSolanaConnection,
  useSolanaTransaction,
} from "@account-kit/react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionConfirmationStrategy,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createUpdateFieldInstruction,
  getMintLen,
} from "@solana/spl-token";
import { pack, TokenMetadata } from "@solana/spl-token-metadata";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LoadingIcon } from "../icons/loading";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";
import { CheckCircleFilledIcon } from "../icons/check-circle-filled";

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
  const { sendTransactionAsync, data, isPending } = useSolanaTransaction({});
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const { connection, signer: solanaSigner } = useSolanaConnection();
  const { setToast } = useToast();

  const handleCollectNFT = async () => {
    if (!solanaSigner) throw new Error("No signer found");
    if (!connection) throw new Error("No connection found");
    setTransactionState("signing");
    setTransactionState("sponsoring");
    const stakeAccount = Keypair.generate();
    const publicKey = new PublicKey(solanaSigner.address);
    const tokenMetadata: TokenMetadata = {
      updateAuthority: publicKey,
      mint: stakeAccount.publicKey,
      name: "QN Pixel",
      symbol: "QNPIX",
      uri: "https://qn-shared.quicknode-ipfs.com/ipfs/QmQFh6WuQaWAMLsw9paLZYvTsdL5xJESzcoSxzb6ZU3Gjx",
      additionalMetadata: [
        ["Background", "Blue"],
        ["WrongData", "DeleteMe!"],
        ["Points", "0"],
      ],
    };
    const decimals = 6;
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const mint = stakeAccount.publicKey;
    await sendTransactionAsync({
      preSend: async (transaction: VersionedTransaction) => {
        transaction.sign([stakeAccount]);
        return transaction;
      },
      instructions: [
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: mintLen,
          lamports: mintLamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mint,
          publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mint,
          decimals,
          publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: publicKey,
          mint: mint,
          mintAuthority: publicKey,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          uri: tokenMetadata.uri,
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: publicKey,
          field: tokenMetadata.additionalMetadata[0][0],
          value: tokenMetadata.additionalMetadata[0][1],
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: publicKey,
          field: tokenMetadata.additionalMetadata[1][0],
          value: tokenMetadata.additionalMetadata[1][1],
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: publicKey,
          field: tokenMetadata.additionalMetadata[2][0],
          value: tokenMetadata.additionalMetadata[2][1],
        }),
      ],
    });

    setTransactionState("complete");
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

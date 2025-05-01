import { useToast } from "@/hooks/useToast";
import { useSolanaTransaction } from "@account-kit/react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
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
import { LoadingIcon } from "../icons/loading";
import { Button } from "./Button";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";
import { CheckCircleFilledIcon } from "../icons/check-circle-filled";
import { useState } from "react";

type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

export const SolanaNftCard = () => {
  const [txHash, setTxHash] = useState<[string, string] | null>(null);
  const { setToast } = useToast();
  const {
    sendTransactionAsync,
    isPending,
    connection,
    signer: solanaSigner,
  } = useSolanaTransaction({
    mutation: {
      onError(error) {
        console.log(error);
        setToast({
          type: "error",
          text: "Error sending transaction",
          open: true,
        });
      },
    },
  });
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const handleCollectNFT = async () => {
    if (!solanaSigner) throw new Error("No signer found");
    if (!connection) throw new Error("No connection found");
    setTransactionState("signing");
    setTransactionState("sponsoring");
    const stakeAccount = Keypair.generate();
    const publicKey = new PublicKey(solanaSigner.address);
    const metaData: (readonly [string, string])[] = [
      ["Background", "Blue"],
      ["WrongData", "DeleteMe!"],
      ["Points", "0"],
    ];
    const tokenMetadata: TokenMetadata = {
      updateAuthority: publicKey,
      mint: stakeAccount.publicKey,
      name: "Alchemy Duck",
      symbol: "ALCHDUCK",
      uri: "https://qn-shared.quicknode-ipfs.com/ipfs/QmQFh6WuQaWAMLsw9paLZYvTsdL5xJESzcoSxzb6ZU3Gjx",
      additionalMetadata: metaData,
    };
    const decimals = 6;
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const mint = stakeAccount.publicKey;
    const tx = await sendTransactionAsync({
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
        ...metaData.map(([key, value]) =>
          createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: publicKey,
            field: key,
            value: value,
          })
        ),
      ],
    });
    setTxHash([tx.hash, mint.toBase58()]);

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

  const renderTransactionStates = (
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
  const content = (
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
        renderTransactionStates
      )}
    </>
  );

  return (
    <Card
      badgeSlot={<Badge text="New!" className="text-[#F3F3FF] bg-[#16A34A]" />}
      imageSlot={imageSlot}
      heading="Solana Gasless Transactions"
      content={content}
      buttons={
        <>
          {txHash && (
            <>
              <Button
                className="mb-2 w-full"
                onClick={() => {
                  window.open(
                    `https://explorer.solana.com/tx/${txHash[0]}?cluster=devnet`,
                    "_blank"
                  );
                }}
              >
                View on Explorer
              </Button>

              <Button
                className="mb-2 w-full"
                onClick={() => {
                  window.open(
                    `https://explorer.solana.com/address/${txHash[1]}?cluster=devnet`,
                    "_blank"
                  );
                }}
              >
                View Token on Explorer
              </Button>
            </>
          )}
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
        </>
      }
    />
  );
};

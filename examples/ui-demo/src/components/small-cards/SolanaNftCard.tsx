import { useToast } from "@/hooks/useToast";
import { useSolanaTransaction } from "@account-kit/react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
  Transaction,
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
import { ExternalLinkIcon } from "lucide-react";
import { Stage } from "./Stage";
type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

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
      const stakeAccount = Keypair.generate();
      const publicKey = new PublicKey(solanaSigner.address);
      const metaData: (readonly [string, string])[] = [
        ["SampleData", "ChangeMe"],
      ];
      const tokenMetadata: TokenMetadata = {
        updateAuthority: publicKey,
        mint: stakeAccount.publicKey,
        name: "Alchemy Duck",
        symbol: "ALCHDUCK",
        uri: "https://bafybeigtvzjqalevyw67xdhr7am5r3jxe5kjbg4pi2jv3nxvhelptwksoe.ipfs.dweb.link?filename=duckImage.png",
        additionalMetadata: metaData,
      };
      const decimals = 6;
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const mint = stakeAccount.publicKey;
      const instructions = [
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
      ];
      const tx = await sendTransactionAsync({
        // Need to do some modification to the regular signing of the transaction, and in this
        // case, we need to add the stake account signature to the transaction.
        transactionComponents: {
          preSend: addStakeSignature(stakeAccount),
        },
        instructions,
      });

      console.log(`Created transaction: ${tx.hash} 
        https://explorer.solana.com/tx/${tx.hash}?cluster=devnet 
        https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet
      `);

      setToast({
        type: "success",
        text: "Transaction sent",
        open: true,
      });
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

    function addStakeSignature(stakeAccount: Keypair) {
      return async (transaction: Transaction | VersionedTransaction) => {
        if ("version" in transaction) transaction.sign([stakeAccount]);

        return transaction;
      };
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

  const transactionUrl =
    tx?.hash && `https://explorer.solana.com/tx/${tx.hash}?cluster=devnet`;
  const renderTransactionStates = (
    <div className="flex flex-col gap-3">
      <Stage
        icon={getIcon(transactionState, ["complete", "sponsoring"])}
        description="Signing transaction..."
      />
      <Stage
        icon={getIcon(transactionState, ["complete"])}
        description="Sponsoring gas and rent..."
      />
      <Stage
        icon={getIcon(transactionState, ["complete"])}
        description={
          <span className="flex gap-3 justify-between">
            Deploying NFT...
            {transactionUrl && (
              <a
                href={transactionUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="View transaction"
              >
                <ExternalLinkIcon className="stroke-fg-secondary w-4 h-4" />
              </a>
            )}
          </span>
        }
      />
    </div>
  );
  const renderIdleContent = (
    <>
      <p className="text-fg-primary text-sm mb-3">
        Transact with one click using gas sponsorship and background signing.
      </p>

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
        ? "Collect NFT"
        : transactionState === "complete"
        ? "Re-collect NFT"
        : "Collecting NFT..."}
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

function getIcon(state: TransactionState, loadingStates: TransactionState[]) {
  if (!loadingStates.includes(state)) {
    return <LoadingIcon className="h-4 w-4" />;
  }
  return (
    <CheckCircleFilledIcon className=" h-4 w-4 fill-demo-surface-success" />
  );
}

import { useToast } from "@/hooks/useToast";
import { useSolanaTransaction } from "@account-kit/react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { sol } from "@metaplex-foundation/umi";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAddressTooltip } from "../user-connection-avatar/UserAddressLink";
import { ExternalLinkIcon } from "lucide-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
type TransactionState = "idle" | "signing" | "sponsoring" | "complete";

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
export const SolanaNftCard = () => {
  const { setToast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: tx,
    sendTransactionAsync,
    isPending,
    connection,
    signer: solanaSigner,
    signers,
  } = useSolanaTransaction();
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");

  const { data: balance = 0 } = useQuery({
    queryKey: ["solanaBalance", solanaSigner?.address],
    queryFn: async () => {
      if (!solanaSigner) return 0;
      if (!connection) return 0;
      return (
        (await connection.getBalance(new PublicKey(solanaSigner!.address))) /
        LAMPORTS_PER_SOL
      );
    },
  });

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
        data: Buffer.from([]), // poke() has no arguments, so empty buffer
      });
      const tx = await sendTransactionAsync({
        transactionComponents: {
          // Don't do signing, just use the fee payer? Other signing fails
          preSend: (transaction) => transaction,
        },
        instructions: [instruction],
      });
      console.log({
        programId: duckProgramId.toBase58(),
        keys: instruction.keys.map((key) => key.pubkey.toBase58()),
        isSigner: instruction.keys[0].isSigner,
        isWritable: instruction.keys[0].isWritable,
        data: instruction.data.toString("hex"),
        dataLength: instruction.data.length,
        keysLength: instruction.keys.length,
        programIdLength: duckProgramId.toBase58().length,
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
    } finally {
      queryClient.invalidateQueries({
        queryKey: ["solanaBalance", solanaSigner?.address],
      });
    }
  };

  async function fundSol() {
    try {
      const publicKey = solanaSigner?.address;
      if (!publicKey) throw new Error("No public key found");
      const umi = createUmi(new Connection("https://api.devnet.solana.com"));
      await umi.rpc.airdrop(publicKey as any, sol(0.5));
      await new Promise((resolve) => setTimeout(resolve, 500));
      await queryClient.invalidateQueries({
        queryKey: ["solanaBalance", solanaSigner?.address],
      });
      setToast({
        type: "success",
        text: "Funded SOL",
        open: true,
      });
    } catch (error) {
      console.log(error);
      window.open("https://faucet.solana.com/", "_blank");
    }
  }

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

  const nextButton =
    balance < 0.05 ? (
      <Button className="mt-auto w-full" onClick={fundSol}>
        Get SOL
      </Button>
    ) : (
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

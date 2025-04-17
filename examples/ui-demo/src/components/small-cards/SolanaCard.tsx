import { useToast } from "@/hooks/useToast";
import {
  useSigner,
  useSignerStatus,
  useSolanaTransaction,
  useSolanaMessageSigned,
  AlchemySolanaWeb3Context,
} from "@account-kit/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { Hex } from "viem";
import { LoadingIcon } from "../icons/loading";
import { UserAddressTooltip } from "../user-connection-avatar/UserAddressLink";
import { Button } from "./Button";
import * as solanaNetwork from "../../../../../account-kit/react/src/solanaNetwork";
import { Card } from "./Card";
import Image from "next/image";
import { Badge } from "./Badge";

export const SolanaCard = () => {
  const [useSponsorship, setUseSponsorship] = useState(false);
  const transactionRemoveSponsorship = useSponsorship ? {} : { policyId: "" };
  const signer = useSigner();
  const status = useSignerStatus();
  const queryClient = useQueryClient();
  const solanaSigner = useMemo(() => {
    if (!signer) return;
    if (!status.isConnected) return;
    return signer.experimental_toSolanaSigner();
  }, [signer, status.isConnected]);
  const web3Context = useContext(AlchemySolanaWeb3Context);
  const { setToast } = useToast();
  const { data: balance = 0, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["solanaBalance", solanaSigner?.address],
    queryFn: async () => {
      if (!solanaSigner) return 0;
      if (!web3Context) return 0;
      return (
        (await solanaNetwork.balance(
          web3Context.connection,
          solanaSigner!.address
        )) / LAMPORTS_PER_SOL
      );
    },
  });

  const {
    mutate,
    isPending,
    data: { hash: txHash = null } = {},
    reset: resetTransaction,
  } = useSolanaTransaction({
    transaction: {
      amount: 1000000,
      toAddress:
        process.env.NEXT_PUBLIC_SOLANA_ADD2RESS || solanaSigner?.address || "",
    },
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["solanaBalance", solanaSigner?.address],
        });
      },
      onError: (error: unknown) => {
        console.log(error);
        setToast({
          type: "error",
          text: "Error sending transaction",
          open: true,
        });
      },
    },
    ...transactionRemoveSponsorship,
  });

  const {
    isPending: isSigningMessage,
    mutate: signHello,
    data: signature,
    reset,
  } = useSolanaMessageSigned({
    message: "Hello",
    mutation: {
      onSuccess: (signature: Hex) => {
        console.log(
          `"Hello" signed with ${solanaSigner?.address}: ${signature}`
        );
        setToast({
          type: "success",
          text: `Message signed!`,
          open: true,
        });
        setTimeout(() => {
          reset();
        }, 2500);
      },
    },
  });

  const imageSlot = (
    <div className="w-full h-full bg-[#DCFCE7] flex justify-center items-center relative">
      <div className="flex flex-col items-center">
        <Image
          className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]"
          src="https://static.alchemyapi.io/images/emblems/solana-mainnet.svg"
          alt="Solana Mainnet"
          width={94}
          height={94}
        />
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            onChange={() => {
              setUseSponsorship(!useSponsorship);
              resetTransaction();
            }}
          />
          <span className="text-sm">Use Sponsorship</span>
        </label>
      </div>
    </div>
  );

  const content = useMemo(
    () => (
      <>
        <p className="text-fg-primary text-sm">
          Send a transaction or sign a message on Solana.
        </p>
        {!solanaSigner || isBalanceLoading ? (
          <div className="flex flex-1 w-full justify-center items-center">
            <LoadingIcon />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-fg-primary text-sm">
              <span className="font-semibold">Address</span>:{" "}
              <UserAddressTooltip address={solanaSigner.address} />
            </p>
            <p className="text-fg-primary text-sm">
              <span className="font-semibold">Balance</span>:{" "}
              {balance.toFixed(3)} SOL
            </p>
          </div>
        )}
      </>
    ),
    [balance, isBalanceLoading, solanaSigner]
  );

  const buttons = useMemo(
    () => (
      <div className="mt-auto w-full">
        <Button
          className="mb-2 w-full"
          disabled={!solanaSigner || isPending || isBalanceLoading}
          onClick={() => {
            if (balance === 0) {
              window.open("https://faucet.solana.com/", "_blank");
            } else if (!txHash) {
              mutate();
            } else {
              window.open(
                `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
                "_blank"
              );
            }
          }}
        >
          {balance === 0 && solanaSigner
            ? "Go to Faucet"
            : isPending
            ? "Sending..."
            : txHash
            ? "View on Explorer"
            : "Send transaction"}
        </Button>
        <Button
          className="w-full"
          disabled={!solanaSigner || isSigningMessage}
          onClick={() => {
            signHello();
          }}
        >
          {isSigningMessage
            ? "Signing..."
            : signature
            ? "Signed"
            : `Sign message`}
        </Button>
      </div>
    ),
    [
      balance,
      isBalanceLoading,
      isPending,
      isSigningMessage,
      mutate,
      signHello,
      signature,
      solanaSigner,
      txHash,
    ]
  );

  return (
    <Card
      badgeSlot={<Badge text="New!" className="text-[#F3F3FF] bg-[#16A34A]" />}
      imageSlot={imageSlot}
      heading="Solana wallets"
      content={content}
      buttons={buttons}
    />
  );
};

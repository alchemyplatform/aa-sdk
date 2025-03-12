import { useToast } from "@/hooks/useToast";
import { useSigner, useSignerStatus } from "@account-kit/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toBytes, toHex } from "viem";
import { LoadingIcon } from "../icons/loading";
import { UserAddressTooltip } from "../user-connection-avatar/UserAddressLink";
import { Button } from "./Button";
import { createTransfer } from "./solana/createSolanaTransfer";
import * as solanaNetwork from "./solana/solanaNetwork";

const connection = solanaNetwork.connect();

export const SolanaCard = () => {
  const signer = useSigner();
  const status = useSignerStatus();
  const queryClient = useQueryClient();
  const solanaSigner = useMemo(() => {
    if (!signer) return;
    if (!status.isConnected) return;
    return signer.experimental_toSolanaSigner();
  }, [signer, status.isConnected]);
  const { setToast } = useToast();

  const { data: balance = 0, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["solanaBalance", solanaSigner?.address],
    queryFn: async () => {
      if (!solanaSigner) return 0;
      return (
        (await solanaNetwork.balance(connection, solanaSigner!.address)) /
        LAMPORTS_PER_SOL
      );
    },
  });

  const {
    mutate,
    isPending,
    data: txHash,
  } = useMutation({
    mutationFn: async () => {
      if (!solanaSigner) return;

      const tx = await createTransfer({
        fromAddress: solanaSigner.address!,
        amount: 1000000,
        toAddress: "tkhqC9QX2gkqJtUFk2QKhBmQfFyyqZXSpr73VFRi35C",
        version: "legacy",
        connection,
      });

      await solanaSigner.addSignature(tx);
      return solanaNetwork.broadcast(connection, tx);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["solanaBalance", solanaSigner?.address],
      });
    },
    onError: (error) => {
      console.log(error);
      setToast({
        type: "error",
        text: "Error sending transaction",
        open: true,
      });
    },
  });

  const {
    isPending: isSigningMessage,
    mutate: signHello,
    data: signature,
    reset,
  } = useMutation({
    mutationFn: async () => {
      if (!solanaSigner) return;

      const message = "Hello";

      return await solanaSigner.signMessage(toBytes(message)).then(toHex);
    },
    onSuccess: (signature) => {
      console.log(`"Hello" signed with ${solanaSigner?.address}: ${signature}`);
      setToast({
        type: "success",
        text: `Message signed!`,
        open: true,
      });
      setTimeout(() => {
        reset();
      }, 2500);
    },
  });

  return (
    <div className="bg-bg-surface-default rounded-lg p-4 w-full xl:p-6 xl:w-[326px] xl:h-[500px] flex flex-col shadow-smallCard mb-5 xl:mb-0 min-h-[220px]">
      <div className="flex gap-3 xl:gap-0 xl:flex-col">
        <div className="flex-shrink-0 bg-[#DCFCE7] rounded-xl mb-4 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <p className="absolute top-[-6px] left-[-6px] sm:top-1 sm:left-1 xl:left-auto xl:right-4 xl:top-4 px-2 py-1 font-semibold rounded-md text-xs text-[#F3F3FF] bg-[#16A34A]">
            New!
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]"
            src="https://static.alchemyapi.io/images/emblems/solana-mainnet.svg"
            alt="Solana Mainnet"
          ></img>
        </div>
        <div className="flex flex-col gap-2 mb-3">
          <h3 className="text-fg-primary  xl:text-xl font-semibold">
            Solana wallets
          </h3>
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
        </div>
      </div>
      <Button
        className="mt-auto mb-1"
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
        className="mt-auto"
        disabled={!solanaSigner || isSigningMessage}
        onClick={() => signHello()}
      >
        {isSigningMessage
          ? "Signing..."
          : signature
          ? "Signed"
          : `Sign message`}
      </Button>
    </div>
  );
};

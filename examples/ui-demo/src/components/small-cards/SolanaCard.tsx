import { useSigner, useSignerStatus } from "@account-kit/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LoadingIcon } from "../icons/loading";
import ExternalLink from "../shared/ExternalLink";
import { Button } from "./Button";
import { createTransfer } from "./solana/createSolanaTransfer";
import * as solanaNetwork from "./solana/solanaNetwork";

export const SolanaCard = () => {
  const signer = useSigner();
  const status = useSignerStatus();
  const solanaSigner = useMemo(() => {
    if (!signer) return;
    if (!status.isConnected) return;
    return signer.toSolanaSigner();
  }, [signer, status.isConnected]);
  const connection = solanaNetwork.connect();

  const truncatedAddress = useMemo(() => {
    if (!solanaSigner) return "";

    return `${solanaSigner.address.slice(0, 3)}...${solanaSigner.address.slice(
      solanaSigner.address.length - 3
    )}`;
  }, [solanaSigner]);

  const { data } = useQuery({
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
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="bg-bg-surface-default rounded-lg p-4 w-full xl:p-6 xl:w-[326px] xl:h-[478px] flex flex-col shadow-smallCard mb-5 xl:mb-0">
      <div className="flex gap-3 xl:gap-0 xl:flex-col">
        <div className="flex-shrink-0 bg-[#EAEBFE] rounded-xl mb-4 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <p className="absolute top-[-6px] left-[-6px] sm:top-1 sm:left-1 xl:left-auto xl:right-4 xl:top-4 px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
            New!
          </p>
          <img
            className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]"
            src="https://static.alchemyapi.io/images/emblems/solana-mainnet.svg"
            alt="Solana Mainnet"
          ></img>
        </div>
        <div className="mb-3">
          <h3 className="text-fg-primary  xl:text-xl font-semibold mb-2 xl:mb-3">
            Solana transactions
          </h3>
          <p className="text-fg-primary text-sm">
            Use the Alchemy Signer as a Solana Wallet.
          </p>
          {!solanaSigner ? (
            <LoadingIcon />
          ) : (
            <p className="text-fg-primary text-sm">
              Address:{" "}
              <ExternalLink
                className="text-fg-primary underline text-md md:text-sm"
                href={`https://explorer.solana.com/address/${solanaSigner.address}?cluster=devnet`}
              >
                {truncatedAddress}
              </ExternalLink>
            </p>
          )}
          {solanaSigner && (
            <p className="text-fg-primary text-sm">Balance: {data ?? 0} SOL</p>
          )}
          {txHash && (
            <p className="text-fg-primary text-sm">
              Transaction:{" "}
              <ExternalLink
                className="text-fg-primary underline text-md md:text-sm"
                href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
              >
                View on Solana Explorer
              </ExternalLink>
            </p>
          )}
        </div>
      </div>
      <Button
        className="mt-auto"
        disabled={!solanaSigner || isPending}
        onClick={() => mutate()}
      >
        {isPending ? "Sending..." : "Send Transaction"}
      </Button>
    </div>
  );
};

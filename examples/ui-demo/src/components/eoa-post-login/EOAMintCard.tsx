"use client";

import { useCallback } from "react";
import {
  useSendUserOperation,
  useSigner,
  useSignMessage,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { encodeFunctionData } from "viem";

export const EOAMintCard = () => {
  const user = useUser();
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { signMessageAsync } = useSignMessage({
    client,
  });
  const signer = useSigner();

  // Configure User Operation (transaction) sender, passing client which can be undefined
  const { sendUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash }) => {
      // eslint-disable-next-line no-console
      console.log(`Transaction hash: ${hash}`);
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error("Error executing the transaction:", err);
    },
  });

  const signMessage = useCallback(
    async (data: string) => {
      if (user?.type === "eoa") {
        const sm = await signMessageAsync({ message: data });
        console.log("sm", sm);
        return sm;
      }
      // different handling for SCA, since signMessageAsync returns signature string
      // that is completely different from signer.signMessage
      else return await signer?.signMessage(data);
    },
    [signer, user?.type]
  );

  const handleCollectNFTUo = useCallback(() => {
    return sendUserOperation({
      uo: {
        target: nftContractAddress,
        data: encodeFunctionData({
          abi: AccountKitNftMinterABI,
          functionName: "mintTo",
          args: [user!.address],
        }),
      },
    });
  }, [sendUserOperation]);

  return (
    <div className="flex mt-0 lg:justify-center flex-col lg:h-full mb-6">
      <div className="lg:self-center">
        <button
          className="akui-btn akui-btn-primary h-10 w-full p-2 radius mb-4 lg:mb-4"
          onClick={() => handleCollectNFTUo()}
        >
          Mint NFT (UO)
        </button>
        <button
          className="akui-btn akui-btn-secondary h-10 w-full p-2 radius mb-4 lg:mb-4"
          onClick={() => signMessage("hello")}
        >
          Sign Message
        </button>
      </div>
    </div>
  );
};

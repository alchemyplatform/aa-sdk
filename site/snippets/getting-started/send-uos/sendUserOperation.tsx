import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { Address, Chain, Transport } from "viem";

export const useSendUserOperation = (
  provider:
    | AlchemySmartAccountClient<Transport, Chain, MultiOwnerModularAccount>
    | undefined
) => {
  const sendUO = useCallback(async () => {
    if (provider == null) {
      return;
    }

    const vitalik: Address = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

    const { hash } = await provider.sendUserOperation({
      uo: {
        target: vitalik,
        data: "0x",
      },
    });

    const txnHash = await provider.waitForUserOperationTransaction({
      hash,
    });

    return { uoHash: hash, txnHash };
  }, [provider]);

  const {
    mutate: sendUserOperation,
    data,
    isPending: isPendingUserOperation,
    isError: isSendUserOperationError,
  } = useMutation({
    mutationFn: sendUO,
  });

  return {
    sendUserOperation,
    uoHash: data?.uoHash,
    txnHash: data?.txnHash,
    isPendingUserOperation,
    isSendUserOperationError,
  };
};

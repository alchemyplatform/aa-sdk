import { type SendUserOperationResult } from "@alchemy/aa-core";
import { useAlertContext } from "@context/alert";
import { useWalletContext } from "@context/wallet";
import postTxStore from "@store/postTxStore";
import { useRecoilState } from "recoil";
import { PostTxStatus, type PostTxReturn } from "types/postTx";
import { type Address, type Hex, type TransactionReceipt } from "viem";

type UsePostTxReturn = {
  postTx: (props: {
    data: Hex;
    target: Address;
    value?: bigint;
  }) => Promise<PostTxReturn>;
};

export const usePostTx = (): UsePostTxReturn => {
  const { provider, scaAddress } = useWalletContext();
  const { dispatchAlert } = useAlertContext();
  const [postTxResult, setPostTxResult] = useRecoilState(
    postTxStore.postTxResult,
  );

  const postTx = async ({
    data,
    target,
    value,
  }: {
    data: Hex;
    target: Address;
    value?: bigint;
  }): Promise<PostTxReturn> => {
    if (scaAddress) {
      let uoHash;
      try {
        const { hash }: SendUserOperationResult =
          await provider.sendUserOperation({
            target,
            data,
            value,
          });
        uoHash = hash;
        setPostTxResult({
          [uoHash]: {
            status: PostTxStatus.POST,
          },
        });
        const txHash = await provider.waitForUserOperationTransaction(uoHash);
        setPostTxResult({
          ...postTxResult,
          [uoHash as Hex]: {
            status: PostTxStatus.BROADCAST,
            value: {
              transactionHash: txHash,
            },
          },
        });
        const receipt: TransactionReceipt =
          await provider.rpcClient.waitForTransactionReceipt({
            hash: txHash,
            onReplaced: (replacement) => {
              if (replacement.reason === "cancelled") {
                throw new Error("Transaction was cancelled");
              }
            },
          });
        setPostTxResult({
          ...postTxResult,
          [uoHash as Hex]: {
            status: PostTxStatus.DONE,
            value: receipt,
          },
        });

        return {
          success: true,
          receipt,
        };
      } catch (error: any) {
        const errMsg = error?.message ? error.message : JSON.stringify(error);
        if (uoHash) {
          setPostTxResult({
            ...postTxResult,
            [uoHash as Hex]: {
              status: PostTxStatus.ERROR,
              error: errMsg,
            },
          });
        } else {
          dispatchAlert({
            type: "open",
            alertType: "error",
            message: errMsg,
          });
        }

        return {
          success: false,
          message: errMsg,
          error,
        };
      }
    } else {
      const message = "Not logged in";
      dispatchAlert({
        type: "open",
        alertType: "error",
        message,
      });
      return {
        success: false,
        message,
      };
    }
  };

  return { postTx };
};

export default usePostTx;

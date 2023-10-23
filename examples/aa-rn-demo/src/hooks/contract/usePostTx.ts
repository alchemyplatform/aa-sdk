import { type SendUserOperationResult } from "@alchemy/aa-core";
import { useAlertContext } from "@context/alert";
import { useWalletContext } from "@context/wallet";
import postTxStore from "@store/postTxStore";
import _ from "lodash";
import { useRecoilState } from "recoil";
import { PostTxStatus, type PostTxReturn } from "types/postTx";
import { v4 as uuidv4 } from "uuid";
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
      let uoHash: Hex | null = null;
      let txHash: Hex | null = null;
      const uniqId = uuidv4();
      try {
        setPostTxResult({
          [uniqId]: {
            status: PostTxStatus.UO,
          },
        });
        const { hash }: SendUserOperationResult =
          await provider.sendUserOperation({
            target,
            data,
            value,
          });
        uoHash = hash;
        setPostTxResult({
          [uniqId]: {
            status: PostTxStatus.POST,
            value: {
              userOpHash: uoHash,
            },
          },
        });
        txHash = await provider.waitForUserOperationTransaction(uoHash);
        setPostTxResult({
          ...postTxResult,
          [uniqId]: {
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
          [uniqId]: {
            status: PostTxStatus.DONE,
            value: {
              transactionReceipt: receipt,
            },
          },
        });

        return {
          success: true,
          receipt,
        };
      } catch (error: any) {
        const errMsg = _.truncate(error?.message ?? JSON.stringify(error), {
          length: 300,
        });
        setPostTxResult({
          ...postTxResult,
          [uniqId]: {
            status: PostTxStatus.ERROR,
            value: {
              uoHash: uoHash || undefined,
              txHash: txHash || undefined,
            },
            error: errMsg,
          },
        });
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

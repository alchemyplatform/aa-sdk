import postTxStore from "@store/postTxStore";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { PostTxStatus, type StreamResultType } from "types/postTx";
import { type Hex } from "viem";

export type EffectListType = {
  when: PostTxStatus[];
  action: ((postTxResult: StreamResultType) => void) | (() => void);
}[];

const usePostTxStatusEffect = (
  hash: Hex | undefined,
  {
    effectList,
  }: {
    effectList: EffectListType;
  },
): void => {
  const postTxResult = useRecoilValue(postTxStore.postTxResult);

  useEffect(() => {
    if (!hash || !postTxResult[hash]) return;

    if (postTxResult[hash].status) {
      const actionList = effectList.filter((x) =>
        x.when.includes(postTxResult[hash].status),
      );
      if (actionList.length > 0) {
        actionList.forEach((x) => {
          x.action(postTxResult[hash]);
        });
      }
    }
  }, [effectList, hash, postTxResult]);
};

export default usePostTxStatusEffect;

import postTxStore from "@store/postTxStore";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { PostTxStatus, type StreamResultType } from "types/postTx";

export type EffectListType = {
  when: PostTxStatus[];
  action: ((postTxResult: StreamResultType) => void) | (() => void);
}[];

const usePostTxStatusEffect = (
  postTxResultIds: string[],
  {
    effectList,
  }: {
    effectList: EffectListType;
  },
): void => {
  const postTxResult = useRecoilValue(postTxStore.postTxResult);

  useEffect(() => {
    if (postTxResultIds.length === 0) return;

    postTxResultIds.forEach((id) => {
      if (postTxResult[id].status) {
        const actionList = effectList.filter((x) =>
          x.when.includes(postTxResult[id].status),
        );
        if (actionList.length > 0) {
          actionList.forEach((x) => {
            x.action(postTxResult[id]);
          });
        }
      }
    });
  }, [effectList, postTxResultIds, postTxResult]);
};

export default usePostTxStatusEffect;

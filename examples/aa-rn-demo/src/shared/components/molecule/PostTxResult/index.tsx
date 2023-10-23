import React, { useMemo, useState, type ReactElement } from "react";
import { useRecoilState } from "recoil";

import usePostTxStatusEffect from "@hooks/contract/usePostTxStatusEffect";
import postTxStore from "@store/postTxStore";
import { unset } from "lodash";
import { PostTxStatus } from "types/postTx";
import TxStatus from "./TxStatus";
import TxStatusMini from "./TxStatusMini";

const maxItemsToShow = 3;

const PostTxResult = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [postTxResult, setPostTxResult] = useRecoilState(
    postTxStore.postTxResult,
  );

  const postTxResultIds = Object.keys(postTxResult)
    .filter((x) => !!x)
    .slice(0, maxItemsToShow);

  const onClickClose = (): void => {
    setIsOpen(false);
    setMinimized(false);
    unset(postTxResult, "status");
    setPostTxResult({});
  };

  const effectList = useMemo(
    () => [
      {
        when: [
          PostTxStatus.UO,
          PostTxStatus.POST,
          PostTxStatus.BROADCAST,
          PostTxStatus.DONE,
          PostTxStatus.ERROR,
        ],
        action: (): void => setIsOpen(true),
      },
    ],
    [],
  );
  usePostTxStatusEffect(postTxResultIds, { effectList });

  return postTxResultIds.length > 0 && isOpen ? (
    minimized ? (
      <TxStatusMini onPressClose={onClickClose} setMinimized={setMinimized} />
    ) : (
      <TxStatus onPressClose={onClickClose} setMinimized={setMinimized} />
    )
  ) : (
    <></>
  );
};

export default PostTxResult;

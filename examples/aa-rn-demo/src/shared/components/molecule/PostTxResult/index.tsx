import React, { useMemo, useState, type ReactElement } from "react";
import { useRecoilState } from "recoil";

import usePostTxStatusEffect from "@hooks/contract/usePostTxStatusEffect";
import postTxStore from "@store/postTxStore";
import { unset } from "lodash";
import { PostTxStatus } from "types/postTx";
import { type Hex } from "viem";
import TxStatus from "./TxStatus";
import TxStatusMini from "./TxStatusMini";

const PostTxResult = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [postTxResult, setPostTxResult] = useRecoilState(
    postTxStore.postTxResult,
  );

  const uoHash =
    Object.keys(postTxResult).length > 0
      ? (Object.keys(postTxResult)[0] as Hex)
      : undefined;

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
  usePostTxStatusEffect(uoHash, { effectList });

  return (
    <>
      {uoHash &&
        isOpen &&
        (minimized ? (
          <TxStatusMini
            onPressClose={onClickClose}
            setMinimized={setMinimized}
          />
        ) : (
          <TxStatus onPressClose={onClickClose} setMinimized={setMinimized} />
        ))}
    </>
  );
};

export default PostTxResult;

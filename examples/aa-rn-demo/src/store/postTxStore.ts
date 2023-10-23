import { atom } from "recoil";

import { type StreamResultType } from "types/postTx";
import storeKeys from "./storeKeys";

const postTxResult = atom<{ [key: string]: StreamResultType }>({
  key: storeKeys.postTx.postTxResult,
  default: {},
});

export default {
  postTxResult,
};

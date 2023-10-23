import { type Hex, type TransactionReceipt } from "viem";

export enum PostTxStatus {
  UO = "UO",
  POST = "POST",
  BROADCAST = "BROADCAST",
  DONE = "DONE",
  ERROR = "ERROR",
  READY = "READY",
}

type StreamReady = {
  status: PostTxStatus.READY;
};
type StreamUO = {
  status: PostTxStatus.UO;
};
type StreamPost = {
  status: PostTxStatus.POST;
  value: {
    userOpHash: Hex;
  };
};
type StreamBroadcast = {
  status: PostTxStatus.BROADCAST;
  value: {
    transactionHash: Hex;
  };
};
type StreamDone = {
  status: PostTxStatus.DONE;
  value: {
    transactionReceipt: TransactionReceipt;
  };
};
type StreamError = {
  status: PostTxStatus.ERROR;
  error: unknown;
  value?: {
    uoHash?: Hex;
    txHash?: Hex;
  };
};

export type StreamResultType =
  | StreamReady
  | StreamUO
  | StreamPost
  | StreamBroadcast
  | StreamDone
  | StreamError;

export type PostTxReturn =
  | {
      success: true;
      receipt: {
        transactionHash: string;
      };
    }
  | {
      success: false;
      message: string;
      error?: unknown;
    };

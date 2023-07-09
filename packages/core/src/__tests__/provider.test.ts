import type { Transaction } from "viem";
import { polygonMumbai } from "viem/chains";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { SmartAccountProvider } from "../provider/base.js";
import type { UserOperationReceipt } from "../types.js";

describe(
  "Base Tests",
  () => {
    let retryMsDelays: number[] = [];

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(global, "setTimeout").mockImplementation(
        // @ts-ignore: Mock implementation doesn't need to return a Timeout.
        (callback: () => void, ms) => {
          if (ms != null) {
            retryMsDelays.push(ms);
          }
          callback();
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      retryMsDelays = [];
    });

    it("should apply only the initial delay for waitForUserOperationTransaction", async () => {
      const providerMock = new SmartAccountProvider(
        "ALCHEMY_RPC_URL",
        "0xENTRYPOINT_ADDRESS",
        polygonMumbai
      );

      const getUserOperationReceiptMock = vi
        .spyOn(providerMock, "getUserOperationReceipt")
        .mockImplementation(() => {
          return Promise.resolve({
            receipt: { transactionHash: "0xMOCK_USER_OP_RECEIPT" },
          } as unknown as UserOperationReceipt);
        });
      expect(getUserOperationReceiptMock.getMockName()).toEqual(
        "getUserOperationReceipt"
      );

      const getTransactionMock = vi
        .spyOn(providerMock, "getTransaction")
        .mockImplementation(() => {
          return Promise.resolve({
            hash: "0xMOCK_TXN_HASH",
          } as unknown as Transaction);
        });
      expect(getTransactionMock.getMockName()).toEqual("getTransaction");

      await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
      expect(retryMsDelays).toEqual([2_000]);
      expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(1);
    });

    it("should retry twice with exponential delay for waitForUserOperationTransaction", async () => {
      const providerMock = new SmartAccountProvider(
        "ALCHEMY_RPC_URL",
        "0xENTRYPOINT_ADDRESS",
        polygonMumbai
      );

      const getUserOperationReceiptMock = vi
        .spyOn(providerMock, "getUserOperationReceipt")
        .mockImplementationOnce(() =>
          Promise.reject("Failed request, must retry")
        )
        .mockImplementation(() => {
          return Promise.resolve({
            receipt: { transactionHash: "0xMOCK_USER_OP_RECEIPT" },
          } as unknown as UserOperationReceipt);
        });
      expect(getUserOperationReceiptMock.getMockName()).toEqual(
        "getUserOperationReceipt"
      );

      const getTransactionMock = vi
        .spyOn(providerMock, "getTransaction")
        .mockImplementation(() => {
          return Promise.resolve({
            hash: "0xMOCK_TXN_HASH",
          } as unknown as Transaction);
        });
      expect(getTransactionMock.getMockName()).toEqual("getTransaction");

      await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
      expect(retryMsDelays).toEqual([2_000, 3_000]);
      expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(2);
    });

    it("should retry thrice with exponential delay for waitForUserOperationTransaction", async () => {
      const providerMock = new SmartAccountProvider(
        "ALCHEMY_RPC_URL",
        "0xENTRYPOINT_ADDRESS",
        polygonMumbai
      );

      const getUserOperationReceiptMock = vi
        .spyOn(providerMock, "getUserOperationReceipt")
        .mockImplementationOnce(() =>
          Promise.reject("Failed request, must retry")
        )
        .mockImplementationOnce(() =>
          Promise.reject("Failed request, must retry")
        )
        .mockImplementation(() => {
          return Promise.resolve({
            receipt: { transactionHash: "0xMOCK_USER_OP_RECEIPT" },
          } as unknown as UserOperationReceipt);
        });
      expect(getUserOperationReceiptMock.getMockName()).toEqual(
        "getUserOperationReceipt"
      );

      const getTransactionMock = vi
        .spyOn(providerMock, "getTransaction")
        .mockImplementation(() => {
          return Promise.resolve({
            hash: "0xMOCK_TXN_HASH",
          } as unknown as Transaction);
        });
      expect(getTransactionMock.getMockName()).toEqual("getTransaction");

      await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
      expect(retryMsDelays).toEqual([2_000, 3_000, 4_500]);
      expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(3);
    });
  },
  { timeout: 6000 }
);

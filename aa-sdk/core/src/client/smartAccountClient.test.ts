import { custom, type Transaction } from "viem";
import { polygonMumbai } from "viem/chains";
import type { MockInstance } from "vitest";
import * as receiptActions from "../actions/bundler/getUserOperationReceipt.js";
import type { UserOperationReceipt } from "../types.js";
import {
  createDummySmartContractAccount,
  createTestClient,
} from "../utils/testUtils.js";
import { createSmartAccountClient } from "./smartAccountClient.js";

const chain = polygonMumbai;
const getUserOperationReceiptMock = vi.spyOn(
  receiptActions,
  "getUserOperationReceipt"
);

vi.mock("viem", async (importOg) => {
  const actual = await importOg<typeof import("viem")>();
  return {
    ...actual,
    publicActions: () => ({
      getTransaction: () => console.log("I've been mocked!"),
    }),
  };
});

describe("SmartAccountClient Tests", async () => {
  let retryMsDelays: number[] = [];
  const publicClient = createTestClient(chain);

  const account = await createDummySmartContractAccount(publicClient);

  const accountClient = createSmartAccountClient({
    transport: custom({
      request: async ({ method }) => {
        if (method === "eth_getTransactionByHash") {
          return {
            hash: "0xMOCK_TXN_HASH",
          } as unknown as Transaction;
        }
        return;
      },
    }),
    chain,
    account,
  });

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
    vi.spyOn(global.Math, "random").mockImplementation(() => 0.5);
  });

  afterEach(() => {
    vi.resetAllMocks();
    retryMsDelays = [];
  });

  it("should apply only the initial delay for waitForUserOperationTransaction", async () => {
    givenGetUserOperationFailsNTimes(1);
    await accountClient.waitForUserOperationTransaction({
      hash: "0xTHIS_IS_A_TEST",
    });
    thenExpectRetriesToBe([2_050], 1, getUserOperationReceiptMock);
  });

  it("should retry twice with exponential delay for waitForUserOperationTransaction", async () => {
    givenGetUserOperationFailsNTimes(2);
    await accountClient.waitForUserOperationTransaction({
      hash: "0xTHIS_IS_A_TEST",
    });
    thenExpectRetriesToBe([2_050, 3_050], 2, getUserOperationReceiptMock);
  });

  it("should retry thrice with exponential delay for waitForUserOperationTransaction", async () => {
    givenGetUserOperationFailsNTimes(3);
    await accountClient.waitForUserOperationTransaction({
      hash: "0xTHIS_IS_A_TEST",
    });
    thenExpectRetriesToBe(
      [2_050, 3_050, 4_550],
      3,
      getUserOperationReceiptMock
    );
  });

  const givenGetUserOperationFailsNTimes = (times: number) => {
    for (let i = 0; i < times; i++) {
      getUserOperationReceiptMock.mockImplementationOnce(() => {
        if (i < times - 1) {
          return Promise.reject("Failed request, must retry");
        }

        return Promise.resolve({
          receipt: { transactionHash: "0xMOCK_USER_OP_RECEIPT" },
        } as unknown as UserOperationReceipt);
      });
    }
  };

  const thenExpectRetriesToBe = async (
    expectedRetryMsDelays: number[],
    expectedMockCalls: number,
    getUserOperationReceiptMock: MockInstance
  ) => {
    expect(retryMsDelays).toEqual(expectedRetryMsDelays);
    expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(
      expectedMockCalls
    );
  };
});

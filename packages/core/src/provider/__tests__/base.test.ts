import { type Transaction } from "viem";
import { polygonMumbai } from "viem/chains";
import {
  afterEach,
  beforeEach,
  describe,
  it,
  vi,
  type SpyInstance,
} from "vitest";
import type { UserOperationReceipt } from "../../types.js";
import { SmartAccountProvider } from "../base.js";

describe("Base Tests", () => {
  let retryMsDelays: number[] = [];

  const providerMock = new SmartAccountProvider(
    "ALCHEMY_RPC_URL",
    "0xENTRYPOINT_ADDRESS",
    polygonMumbai
  );

  const givenGetUserOperationFailsNTimes = (times: number) => {
    const mock = vi.spyOn(providerMock, "getUserOperationReceipt");
    for (let i = 0; i < times; i++) {
      mock.mockImplementationOnce(() => {
        if (i < times - 1) {
          return Promise.reject("Failed request, must retry");
        }

        return Promise.resolve({
          receipt: { transactionHash: "0xMOCK_USER_OP_RECEIPT" },
        } as unknown as UserOperationReceipt);
      });
    }
    return mock;
  };

  const thenExpectRetriesToBe = async (
    expectedRetryMsDelays: number[],
    expectedMockCalls: number,
    getUserOperationReceiptMock: SpyInstance<
      [hash: `0x${string}`],
      Promise<UserOperationReceipt>
    >
  ) => {
    expect(retryMsDelays).toEqual(expectedRetryMsDelays);
    expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(
      expectedMockCalls
    );
  };

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
    vi.spyOn(providerMock, "getTransaction").mockImplementation(() => {
      return Promise.resolve({
        hash: "0xMOCK_TXN_HASH",
      } as unknown as Transaction);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    retryMsDelays = [];
  });

  it("should apply only the initial delay for waitForUserOperationTransaction", async () => {
    const getUserOperationReceiptMock = givenGetUserOperationFailsNTimes(1);
    await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
    thenExpectRetriesToBe([2_050], 1, getUserOperationReceiptMock);
  });

  it("should retry twice with exponential delay for waitForUserOperationTransaction", async () => {
    const getUserOperationReceiptMock = givenGetUserOperationFailsNTimes(2);
    await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
    thenExpectRetriesToBe([2_050, 3_050], 2, getUserOperationReceiptMock);
  });

  it("should retry thrice with exponential delay for waitForUserOperationTransaction", async () => {
    const getUserOperationReceiptMock = givenGetUserOperationFailsNTimes(3);
    await providerMock.waitForUserOperationTransaction("0xTHIS_IS_A_TEST");
    thenExpectRetriesToBe(
      [2_050, 3_050, 4_550],
      3,
      getUserOperationReceiptMock
    );
  });

  it("should emit connected event on connected", async () => {
    const spy = vi.spyOn(providerMock, "emit");
    const account = {
      chain: polygonMumbai,
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      rpcClient: providerMock.rpcClient,
      getAddress: async () => "0xMOCK_ADDRESS",
    } as any;

    // This says the await is not important... it is. the method is not marked sync because we don't need it to be,
    // but the address is emited from an async method so we want to await that
    await providerMock.connect(() => account);

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "connect",
          {
            "chainId": "0x13881",
          },
        ],
        [
          "accountsChanged",
          [
            "0xMOCK_ADDRESS",
          ],
        ],
      ]
    `);
  });

  it("should emit disconnected event on disconnect", async () => {
    const spy = vi.spyOn(providerMock, "emit");
    providerMock.disconnect();

    expect(spy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "disconnect",
        ],
        [
          "accountsChanged",
          [],
        ],
      ]
    `);
  });
});

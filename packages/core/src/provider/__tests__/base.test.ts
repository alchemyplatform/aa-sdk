import { type Address, type Chain, type Transaction } from "viem";
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
import { getDefaultEntryPointAddress } from "../../utils/index.js";
import { SmartAccountProvider } from "../base.js";

const chain = polygonMumbai;
const entryPointAddress = getDefaultEntryPointAddress(chain);

describe("Base Tests", () => {
  let retryMsDelays: number[] = [];
  let dummyEntryPointAddress =
    "0x1234567890123456789012345678901234567890" as Address;

  const providerMock = new SmartAccountProvider({
    rpcProvider: "ALCHEMY_RPC_URL",
    chain,
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
      chain,
      entryPointAddress,
      rpcClient: providerMock.rpcClient,
      getAddress: async () => "0xMOCK_ADDRESS",
      getFactoryAddress: () => "0xMOCK_FACOTRY_ADDRESS",
      getOwner: () => undefined,
    } as any;

    // This says the await is not important... it is. the method is not marked sync because we don't need it to be,
    // but the address is emitted from an async method so we want to await that
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

  it("should correctly extend the provider", async () => {
    const newProvider = providerMock.extend((provider) => ({
      newMethod: () => provider.buildUserOperation,
    }));

    expect(newProvider.newMethod).toBeDefined();
    expect(newProvider.newMethod()).toBe(providerMock.buildUserOperation);
    expect(newProvider.buildUserOperation).toBe(
      providerMock.buildUserOperation
    );
  });

  it("should support chaining extends", async () => {
    const newProvider = providerMock
      .extend((provider) => ({
        newMethod: () => provider.buildUserOperation,
      }))
      .extend((provider) => ({ newMethod2: () => provider.newMethod }));

    expect(newProvider.newMethod).toBeDefined();
    expect(newProvider.newMethod()).toEqual(providerMock.buildUserOperation);
    expect(newProvider.newMethod2).toBeDefined();
    expect(newProvider.newMethod2()).toEqual(newProvider.newMethod);
  });

  it("should not allow extending with methods already defined", async () => {
    const newProvider = providerMock.extend((provider) => ({
      sendUserOperation: provider.dropAndReplaceUserOperation,
    }));

    expect(newProvider.sendUserOperation).toEqual(
      providerMock.sendUserOperation
    );

    expect(newProvider.sendUserOperation).not.toEqual(
      providerMock.dropAndReplaceUserOperation
    );
  });

  it("should preserve class functions", () => {
    class TestProvider extends SmartAccountProvider {
      testMethod() {
        return "test";
      }
    }

    const provider = new TestProvider({
      rpcProvider: "ALCHEMY_RPC_URL",
      chain,
    });

    const newProvider = provider.extend(() => ({
      newMethod: () => 1,
    }));

    expect(newProvider.testMethod()).toEqual("test");
  });

  it("should correctly do runtime validation when entrypoint is invalid", () => {
    expect(
      () =>
        new SmartAccountProvider({
          rpcProvider: "ALCHEMY_RPC_URL",
          entryPointAddress: 1 as unknown as Address,
          chain: polygonMumbai,
        })
    ).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            \\"entryPointAddress\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        }
      ]"
    `);
  });

  it("should correctly do runtime validation when multiple inputs are invalid", () => {
    expect(
      () =>
        new SmartAccountProvider({
          rpcProvider: "ALCHEMY_RPC_URL",
          entryPointAddress: 1 as unknown as Address,
          chain: "0x1" as unknown as Chain,
        })
    ).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"custom\\",
          \\"message\\": \\"Invalid input\\",
          \\"path\\": [
            \\"chain\\"
          ]
        },
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"string\\",
          \\"received\\": \\"number\\",
          \\"path\\": [
            \\"entryPointAddress\\"
          ],
          \\"message\\": \\"Expected string, received number\\"
        }
      ]"
    `);
  });

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
      Promise<UserOperationReceipt | null>
    >
  ) => {
    expect(retryMsDelays).toEqual(expectedRetryMsDelays);
    expect(getUserOperationReceiptMock).toHaveBeenCalledTimes(
      expectedMockCalls
    );
  };
});

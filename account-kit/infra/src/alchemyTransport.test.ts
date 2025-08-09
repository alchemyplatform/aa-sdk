import * as AACoreModule from "@aa-sdk/core";
import { createSmartAccountClient } from "@aa-sdk/core";
import { avalanche } from "viem/chains";
import { alchemy } from "./alchemyTransport.js";
import { sepolia } from "./chains.js";
import { createBundlerClient } from "viem/account-abstraction";

describe("Alchemy Transport Tests", () => {
  it.each([
    { rpcUrl: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { rpcUrl: "/api", jwt: "jwt" },
  ])("should successfully create a non-split transport", (args) => {
    expect(() =>
      alchemy({
        ...args,
      }),
    ).not.toThrowError();
  });

  it.each([
    { rpcUrl: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { rpcUrl: "/api", jwt: "jwt" },
  ])("should correctly create a split transport", (args) => {
    const splitSpy = vi.spyOn(AACoreModule, "split");
    alchemy({
      alchemyConnection: args,
      nodeRpcUrl: "/test",
    })({ chain: sepolia });

    expect(splitSpy.mock.calls.length).toBe(1);
    expect(splitSpy.mock.calls[0]).toMatchSnapshot();
  });

  it("should correctly do runtime validation when chain is not supported by Alchemy", () => {
    expect(() => alchemy({ rpcUrl: "/test" })({ chain: avalanche }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "message": "chain must include an alchemy rpc url. See \`defineAlchemyChain\` or import a chain from \`@account-kit/infra\`.",
          "fatal": true,
          "path": []
        }
      ]]
    `);
  });

  it.each([0, 1, 2, 3])(
    "respects retryCount of %i when used with a viem bundler client",
    async (retryCount) => {
      const { mockFetch, unstub } = givenMockFetchError();

      const client = createBundlerClient({
        transport: alchemy({
          rpcUrl: "http://invalid",
          retryCount,
        }),
        chain: sepolia,
      });

      await expect(
        client.request({
          // @ts-expect-error - Method doesn't matter for this test.
          method: "eth_blockNumber",
        }),
      ).rejects.toThrow();

      expect(mockFetch.mock.calls.length).toEqual(retryCount + 1);
      unstub();
    },
  );

  it.each([0, 1, 2, 3])(
    "respects retryCount of %i when used with an alchemy smart account client",
    async (retryCount) => {
      const { mockFetch, unstub } = givenMockFetchError();

      const client = createSmartAccountClient({
        transport: alchemy({
          apiKey: "invalid",
          retryCount,
        }),
        chain: sepolia,
      });

      await expect(
        client.request({
          method: "eth_blockNumber",
        }),
      ).rejects.toThrow();

      expect(mockFetch.mock.calls.length).toEqual(retryCount + 1);
      unstub();
    },
  );
});

// Mocks global fetch to always return a 500 error.
const givenMockFetchError = () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: () => Promise.resolve({ error: "Internal Server Error" }),
    text: () => Promise.resolve("Internal Server Error"),
  });
  vi.stubGlobal("fetch", mockFetch);
  return {
    mockFetch,
    unstub: () => vi.unstubAllGlobals(),
  };
};

import { LocalAccountSigner } from "@aa-sdk/core";
import type { AlchemyTransport } from "@account-kit/infra";
import { describe, expect, it } from "vitest";
import {
  createTransport,
  defineChain,
  RpcRequestError,
  type Hex,
  type Transport,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { createSmartWalletClient } from "./index.js";

const chain = defineChain({
  id: 25,
  name: "cronos",
  nativeCurrency: { name: "CRO", symbol: "CRO", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:9"] },
    alchemy: { http: ["http://127.0.0.1:9"] },
  },
});

// Fake AlchemyTransport that counts requests and throws a wire-shaped RpcRequestError.
function createCountingAlchemyTransport(error: {
  code: number;
  message: string;
  data?: unknown;
}): { transport: AlchemyTransport; getRequestCount: () => number } {
  let requestCount = 0;

  const base: Transport = () =>
    createTransport({
      key: "alchemy",
      name: "Alchemy Transport",
      type: "alchemy",
      retryCount: 0,
      request: async ({ method }) => {
        if (method !== "wallet_prepareCalls") {
          throw new Error(`unexpected method ${method}`);
        }
        requestCount += 1;
        throw new RpcRequestError({
          body: { method },
          error: {
            code: error.code,
            message: error.message,
            data: error.data,
          },
          url: "http://127.0.0.1:9",
        });
      },
    });

  const transport = Object.assign(base, {
    updateHeaders() {},
    config: { apiKey: "test" },
    dynamicFetchOptions: {},
  }) as AlchemyTransport;

  return {
    transport,
    getRequestCount: () => requestCount,
  };
}

describe("createSmartWalletClient error fidelity", () => {
  it("does not retry -32521 and preserves code + revertData", async () => {
    const { transport, getRequestCount } = createCountingAlchemyTransport({
      code: -32521,
      message:
        "An error occurred while executing user operation: execution reverted",
      data: { revertData: "0x" as Hex },
    });

    const client = createSmartWalletClient({
      transport,
      chain,
      signer:
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
      account: "0x0000000000000000000000000000000000000001",
    });

    let thrown: unknown;
    try {
      await client.request({
        method: "wallet_prepareCalls",
        params: [
          {
            from: "0x0000000000000000000000000000000000000001",
            chainId: "0x19",
            calls: [
              {
                to: "0x0000000000000000000000000000000000000002",
                data: "0x",
              },
            ],
          },
        ],
      });
    } catch (error) {
      thrown = error;
    }

    expect(getRequestCount()).toBe(1);
    expect(thrown).toMatchObject({
      code: -32521,
      data: { revertData: "0x" },
    });
  });

  it("does not rewrite or amplify a real -32603 when alchemy retryCount is 0", async () => {
    const { transport, getRequestCount } = createCountingAlchemyTransport({
      code: -32603,
      message: "Internal JSON-RPC error.",
    });

    const client = createSmartWalletClient({
      transport,
      chain,
      signer:
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
      account: "0x0000000000000000000000000000000000000001",
    });

    let thrown: unknown;
    try {
      await client.request({
        method: "wallet_prepareCalls",
        params: [
          {
            from: "0x0000000000000000000000000000000000000001",
            chainId: "0x19",
            calls: [
              {
                to: "0x0000000000000000000000000000000000000002",
                data: "0x",
              },
            ],
          },
        ],
      });
    } catch (error) {
      thrown = error;
    }

    expect(getRequestCount()).toBe(1);
    expect(thrown).toMatchObject({ code: -32603 });
  });
});

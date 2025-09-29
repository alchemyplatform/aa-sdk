import { createSmartWalletClient } from "../client/index.js";
import { swapActions } from "./swapActionsDecorator.js";
import { alchemy, arbitrum } from "@account-kit/infra";

describe("swapActions decorator tests", () => {
  const transport = alchemy(
    process.env.ALCHEMY_PROXY_RPC_URL
      ? {
          rpcUrl: process.env.ALCHEMY_PROXY_RPC_URL,
        }
      : {
          apiKey: process.env.TEST_ALCHEMY_API_KEY!,
        },
  );

  it("should successfully request a quote", async () => {
    const testAccountAddr = "0x0d1Ea60Dddd2a76F3a3afD6d78660d366C6A30c0";

    const client = createSmartWalletClient({
      transport,
      chain: arbitrum,
      signer: {
        getAddress: async () => testAccountAddr,
        signMessage: async () => {
          throw new Error("Not implemented");
        },
        signTypedData: async () => {
          throw new Error("Not implemented");
        },
        signerType: "test",
        inner: {},
      },
    }).extend(swapActions);

    const account = await client.requestAccount({
      creationHint: {
        accountType: "7702",
      },
    });

    const USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    const NATIVE_TOKEN_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEee"; // from ERC-7528

    const quote = await client.requestQuoteV0({
      from: account.address,
      fromToken: USDC_ARB,
      toToken: NATIVE_TOKEN_ADDR,
      minimumToAmount: "0x5AF3107A4000",
    });

    expect(quote.quote).toBeDefined();
    expect(quote.quote.fromAmount).toBeDefined();
    expect(quote.quote.minimumToAmount).toBeDefined();
    expect(quote.quote.expiry).toBeDefined();
  }, 30_000);
});

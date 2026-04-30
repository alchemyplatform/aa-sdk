import { arbitrum, base } from "viem/chains";
import type { InnerWalletApiClient } from "../../types.js";
import { requestQuoteV0 } from "./requestQuoteV0.js";

const ACCOUNT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1" as const;
const FROM_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEee" as const;
const TO_TOKEN = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as const;

const QUOTE_RESPONSE = {
  rawCalls: true,
  quote: {
    fromAmount: "0x64",
    minimumToAmount: "0x32",
    expiry: "0x1",
  },
  chainId: "0xa4b1",
  calls: [
    {
      to: TO_TOKEN,
      data: "0x",
      value: "0x0",
    },
  ],
} as const;

function createClient(
  request = vi.fn().mockResolvedValue(QUOTE_RESPONSE),
): InnerWalletApiClient {
  return {
    account: { address: ACCOUNT_ADDRESS },
    chain: arbitrum,
    request,
  } as unknown as InnerWalletApiClient;
}

describe("requestQuoteV0", () => {
  it("encodes numeric chain IDs to raw RPC hex strings", async () => {
    const request = vi.fn().mockResolvedValue(QUOTE_RESPONSE);
    const client = createClient(request);

    await requestQuoteV0(client, {
      fromToken: FROM_TOKEN,
      toToken: TO_TOKEN,
      fromAmount: 100n,
      chainId: arbitrum.id,
      toChainId: base.id,
    });

    expect(request).toHaveBeenCalledWith({
      method: "wallet_requestQuote_v0",
      params: [
        expect.objectContaining({
          chainId: "0xa4b1",
          toChainId: "0x2105",
        }),
      ],
    });
  });

  it("rejects hex chainId before sending a request", async () => {
    const request = vi.fn().mockResolvedValue(QUOTE_RESPONSE);
    const client = createClient(request);

    await expect(
      requestQuoteV0(client, {
        fromToken: FROM_TOKEN,
        toToken: TO_TOKEN,
        fromAmount: 100n,
        chainId: "0xa4b1",
      } as never),
    ).rejects.toThrow(
      'Invalid params: chainId must be a number when using requestQuoteV0, e.g. 42161. Hex strings like "0xa4b1" are only valid for raw wallet_requestQuote_v0 RPC calls.',
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("rejects hex toChainId before sending a request", async () => {
    const request = vi.fn().mockResolvedValue(QUOTE_RESPONSE);
    const client = createClient(request);

    await expect(
      requestQuoteV0(client, {
        fromToken: FROM_TOKEN,
        toToken: TO_TOKEN,
        fromAmount: 100n,
        toChainId: "0x2105",
      } as never),
    ).rejects.toThrow(
      'Invalid params: toChainId must be a number when using requestQuoteV0, e.g. 42161. Hex strings like "0xa4b1" are only valid for raw wallet_requestQuote_v0 RPC calls.',
    );
    expect(request).not.toHaveBeenCalled();
  });
});

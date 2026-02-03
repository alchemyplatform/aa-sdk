import { arbitrum, base } from "viem/chains";
import { apiTransport } from "../__tests__/setup.js";
import { createSmartWalletClient } from "../client.js";
import { swapActions } from "./swapActionsDecorator.js";
import { size, type LocalAccount } from "viem";

describe("swapActions decorator tests", () => {
  it("should successfully request a quote", async () => {
    const usdcHolderAddr = "0x463f5D63e5a5EDB8615b0e485A090a18Aba08578";

    const dummySigner = {
      address: usdcHolderAddr,
      type: "local" as const,
    } as unknown as LocalAccount;

    const client = createSmartWalletClient({
      transport: apiTransport,
      chain: arbitrum,
      signer: dummySigner,
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
      chainId: arbitrum.id,
      fromToken: USDC_ARB,
      toToken: NATIVE_TOKEN_ADDR,
      minimumToAmount: 0x5af3107a4000n,
    });

    expect(quote.quote).toBeDefined();
    expect(quote.quote.fromAmount).toBeDefined();
    expect(quote.quote.minimumToAmount).toBeDefined();
    expect(quote.quote.expiry).toBeDefined();
    expect(quote.callId).not.toBeDefined();
  });

  it("should successfully request a cross-chain quote", async () => {
    const usdcHolderAddr = "0x463f5D63e5a5EDB8615b0e485A090a18Aba08578";

    const dummySigner = {
      address: usdcHolderAddr,
      type: "local" as const,
    } as unknown as LocalAccount;

    const client = createSmartWalletClient({
      transport: apiTransport,
      chain: arbitrum,
      signer: dummySigner,
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
      chainId: arbitrum.id,
      fromToken: USDC_ARB,
      toToken: NATIVE_TOKEN_ADDR,
      toChainId: base.id,
      minimumToAmount: 0x5af3107a4000n,
    });

    expect(quote.quote).toBeDefined();
    expect(quote.quote.fromAmount).toBeDefined();
    expect(quote.quote.minimumToAmount).toBeDefined();
    expect(quote.quote.expiry).toBeDefined();
    expect(quote.callId).toBeDefined();
    expect(size(quote.callId!)).toBeGreaterThan(64);
  }, 30_000);
});

import { arbitrum } from "viem/chains";
import { apiTransport } from "../testSetup.js";
import { createSmartWalletClient } from "../client.js";
import { swapActions } from "./swapActionsDecorator.js";
import type { LocalAccount } from "viem/accounts";

describe("swapActions decorator tests", () => {
  it("should successfully request a quote", async () => {
    const usdcHolderAddr = "0x463f5D63e5a5EDB8615b0e485A090a18Aba08578";

    const dummySigner = {
      address: usdcHolderAddr,
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
      fromToken: USDC_ARB,
      toToken: NATIVE_TOKEN_ADDR,
      minimumToAmount: "0x5AF3107A4000",
    });

    expect(quote.quote).toBeDefined();
    expect(quote.quote.fromAmount).toBeDefined();
    expect(quote.quote.minimumToAmount).toBeDefined();
    expect(quote.quote.expiry).toBeDefined();
  });
});

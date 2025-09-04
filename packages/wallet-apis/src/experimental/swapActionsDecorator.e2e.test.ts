import { arbitrum } from "viem/chains";
import { apiTransport } from "../testSetup.js";
import { createSmartWalletClient } from "../client.js";
import { swapActions } from "./swapActionsDecorator.js";
import { privateKeyToAccount } from "viem/accounts";

describe("swapActions decorator tests", () => {
  it("should successfully request a quote", async () => {
    const dummySigner = privateKeyToAccount(
      "0xd7b061ef04d29cf68b3c89356678eccec9988de8d5ed892c19461c4a9d65925d",
    );

    const testAccountAddr = "0x0d1Ea60Dddd2a76F3a3afD6d78660d366C6A30c0";

    const client = createSmartWalletClient({
      transport: apiTransport,
      chain: arbitrum,
      signer: dummySigner,
    }).extend(swapActions);

    const account = await client.requestAccount({
      signerAddress: testAccountAddr,
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

import { describe, it, expect } from "vitest";
import { createWalletClient } from "./client.js";
import type { WalletClientConfig } from "./types.js";

describe("WalletClient", () => {
  it("should create a wallet client with the provided config", () => {
    const config: WalletClientConfig = {
      rpcUrl: "https://eth-mainnet.alchemyapi.io/v2/test",
      chainId: 1,
      timeout: 5000,
    };

    const client = createWalletClient(config);

    expect(client.getConfig()).toEqual(config);
    expect(client.isConnected()).toBe(false);
  });

  it("should connect and disconnect properly", async () => {
    const config: WalletClientConfig = {
      rpcUrl: "https://eth-mainnet.alchemyapi.io/v2/test",
    };

    const client = createWalletClient(config);

    expect(client.isConnected()).toBe(false);

    await client.connect();
    expect(client.isConnected()).toBe(true);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  });
});

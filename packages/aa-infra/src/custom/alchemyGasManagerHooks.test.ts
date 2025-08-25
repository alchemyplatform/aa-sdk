import { describe, it, expect, vi } from "vitest";
import { createClient, http } from "viem";
import { sepolia } from "viem/chains";
import { alchemyGasManagerHooks } from "./alchemyGasManagerHooks.js";

describe("alchemyGasManagerHooks", () => {
  it("should return hooks with spread operator support for tests", () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    expect(hooks).toHaveProperty("paymaster");
    expect(hooks).toHaveProperty("userOperation");
    expect(hooks).toHaveProperty("bind");

    expect(hooks.paymaster).toHaveProperty("getPaymasterStubData");
    expect(hooks.paymaster).toHaveProperty("getPaymasterData");
    expect(hooks.userOperation).toHaveProperty("estimateFeesPerGas");
  });

  it("should return test values when not bound to a client", async () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    const stubResult = await hooks.paymaster.getPaymasterStubData({
      sender: "0x1234567890123456789012345678901234567890",
      nonce: 0n,
      callData: "0x",
      chainId: 1,
      entryPointAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(stubResult).toEqual({
      paymasterAndData: "0x",
      isFinal: false,
    });
  });

  it("should create bound hooks with client", () => {
    const mockAccount = {
      address: "0x1234567890123456789012345678901234567890",
      getStubSignature: vi.fn().mockResolvedValue("0xdummysignature"),
    };

    const client = createClient({
      chain: sepolia,
      transport: http("https://eth-sepolia.g.alchemy.com/v2/test-key"),
      account: mockAccount as any,
    });

    const hooks = alchemyGasManagerHooks("production-policy");
    const boundHooks = hooks.bind(client);

    expect(boundHooks).toHaveProperty("paymaster");
    expect(boundHooks).toHaveProperty("userOperation");
    expect(boundHooks).not.toHaveProperty("bind"); // Bound hooks don't have bind method
  });

  it("should handle ERC-20 token configuration", () => {
    const hooks = alchemyGasManagerHooks("test-policy", {
      address: "0xTokenAddress1234567890123456789012345678",
      maxTokenAmount: 1000000n,
    });

    expect(hooks).toHaveProperty("paymaster");
    expect(hooks).toHaveProperty("userOperation");
    expect(hooks).toHaveProperty("bind");
  });

  it("should maintain separate caches for different bound clients", () => {
    const client1 = createClient({
      chain: sepolia,
      transport: http("https://eth-sepolia.g.alchemy.com/v2/test-key-1"),
    });

    const client2 = createClient({
      chain: sepolia,
      transport: http("https://eth-sepolia.g.alchemy.com/v2/test-key-2"),
    });

    const hooks = alchemyGasManagerHooks("test-policy");
    const boundHooks1 = hooks.bind(client1);
    const boundHooks2 = hooks.bind(client2);

    // Each bound instance should be independent
    expect(boundHooks1).not.toBe(boundHooks2);
    expect(boundHooks1.paymaster).not.toBe(boundHooks2.paymaster);
  });
});

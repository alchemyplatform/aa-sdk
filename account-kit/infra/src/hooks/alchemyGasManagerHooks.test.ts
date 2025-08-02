import { describe, it, expect, vi } from "vitest";
import { alchemyGasManagerHooks } from "./alchemyGasManagerHooks.js";
import { toHex } from "viem";

describe("alchemyGasManagerHooks", () => {
  it("should return paymaster configuration object", () => {
    const hooks = alchemyGasManagerHooks("test-policy-id");

    expect(hooks).toBeDefined();
    expect(hooks.paymaster).toBeDefined();
    expect(typeof hooks.paymaster).toBe("function");
  });

  it("should create paymaster hooks when factory is called", () => {
    const hooks = alchemyGasManagerHooks("test-policy-id");

    // Mock bundler client
    const mockBundlerClient = {
      request: vi.fn(),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    expect(paymasterHooks).toBeDefined();
    expect(paymasterHooks.getPaymasterData).toBeDefined();
    expect(paymasterHooks.getPaymasterStubData).toBeDefined();
    expect(typeof paymasterHooks.getPaymasterData).toBe("function");
    expect(typeof paymasterHooks.getPaymasterStubData).toBe("function");
  });

  it("should call pm_getPaymasterStubData with correct parameters", async () => {
    const policyId = "test-policy-id";
    const hooks = alchemyGasManagerHooks(policyId);

    // Mock bundler client
    const mockBundlerClient = {
      request: vi.fn().mockResolvedValue({
        paymasterAndData: "0x1234567890abcdef",
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    // Test parameters
    const testParams = {
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as `0x${string}`,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
      nonce: 0n,
      callData: "0x" as `0x${string}`,
    };

    const result = await paymasterHooks.getPaymasterStubData(testParams);

    // Verify the bundler client was called correctly
    expect(mockBundlerClient.request).toHaveBeenCalledWith({
      method: "pm_getPaymasterStubData",
      params: [
        expect.objectContaining({
          sender: testParams.sender,
          nonce: toHex(testParams.nonce),
          callData: testParams.callData,
          // Gas values should be zeroed for stub call
          maxFeePerGas: "0x0",
          maxPriorityFeePerGas: "0x0",
          callGasLimit: "0x0",
          verificationGasLimit: "0x0",
          preVerificationGas: "0x0",
          paymasterVerificationGasLimit: "0x0",
          paymasterPostOpGasLimit: "0x0",
        }),
        testParams.entryPointAddress,
        toHex(testParams.chainId),
        { policyId },
      ],
    });

    // Verify the result
    expect(result).toEqual({
      paymasterAndData: "0x1234567890abcdef",
      isFinal: false,
    });
  });

  it("should call pm_getPaymasterData with correct parameters", async () => {
    const policyId = ["policy1", "policy2"];
    const hooks = alchemyGasManagerHooks(policyId);

    // Mock bundler client
    const mockBundlerClient = {
      request: vi.fn().mockResolvedValue({
        paymaster: "0x1234567890abcdef1234567890abcdef12345678",
        paymasterData: "0xabcdef",
        paymasterVerificationGasLimit: 100000n,
        paymasterPostOpGasLimit: 50000n,
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    // Test parameters with gas values
    const testParams = {
      chainId: 1,
      entryPointAddress:
        "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789" as `0x${string}`,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
      nonce: 5n,
      callData: "0x1234" as `0x${string}`,
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000n,
    };

    const result = await paymasterHooks.getPaymasterData(testParams);

    // Verify the bundler client was called correctly
    expect(mockBundlerClient.request).toHaveBeenCalledWith({
      method: "pm_getPaymasterData",
      params: [
        expect.objectContaining({
          sender: testParams.sender,
          nonce: toHex(testParams.nonce),
          callData: testParams.callData,
          maxFeePerGas: toHex(testParams.maxFeePerGas),
          maxPriorityFeePerGas: toHex(testParams.maxPriorityFeePerGas),
        }),
        testParams.entryPointAddress,
        toHex(testParams.chainId),
        { policyId },
      ],
    });

    // Verify the result
    expect(result).toEqual({
      paymaster: "0x1234567890abcdef1234567890abcdef12345678",
      paymasterData: "0xabcdef",
      paymasterVerificationGasLimit: 100000n,
      paymasterPostOpGasLimit: 50000n,
    });
  });

  it("should handle ERC-20 token context", () => {
    const policyId = "test-policy";
    const tokenAddress =
      "0x1234567890abcdef1234567890abcdef12345678" as `0x${string}`;
    const maxTokenAmount = 1000000n;

    const hooks = alchemyGasManagerHooks(policyId, {
      address: tokenAddress,
      maxTokenAmount,
    });

    const mockBundlerClient = {
      request: vi.fn().mockResolvedValue({
        paymasterAndData: "0xabcdef",
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    expect(paymasterHooks).toBeDefined();
    // The token context should be included in the request
  });
});

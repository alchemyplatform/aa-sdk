import { describe, it, expect, vi, beforeEach } from "vitest";
import { alchemyGasManagerHooks } from "../src/alchemyGasManagerHooks.js";
import { toHex, type Address } from "viem";

describe("alchemyGasManagerHooks - Optimized Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should make single RPC call and cache results", async () => {
    const policyId = "test-policy-optimized";
    const hooks = alchemyGasManagerHooks(policyId);

    // Mock bundler client
    const mockBundlerClient = {
      request: vi.fn().mockImplementation(({ method }) => {
        if (method === "alchemy_requestGasAndPaymasterAndData") {
          return Promise.resolve({
            callGasLimit: "0x5208",
            preVerificationGas: "0x5208",
            verificationGasLimit: "0x5208",
            maxFeePerGas: "0x3b9aca00",
            maxPriorityFeePerGas: "0xf4240",
            paymaster: "0x1234567890abcdef1234567890abcdef12345678",
            paymasterData: "0xabcdef",
            paymasterVerificationGasLimit: "0x186a0",
            paymasterPostOpGasLimit: "0xc350",
          });
        }
        return Promise.resolve(null);
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

    // First call - should make RPC request
    const stubResult = await paymasterHooks.getPaymasterStubData(testParams);

    // Verify RPC was called once
    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1);
    expect(mockBundlerClient.request).toHaveBeenCalledWith({
      method: "alchemy_requestGasAndPaymasterAndData",
      params: [
        expect.objectContaining({
          policyId,
          entryPoint: testParams.entryPointAddress,
          userOperation: expect.objectContaining({
            sender: testParams.sender,
            nonce: toHex(testParams.nonce),
            callData: testParams.callData,
          }),
          dummySignature: expect.any(String),
          overrides: {},
        }),
      ],
    });

    // Verify stub result
    expect(stubResult).toMatchObject({
      paymaster: "0x1234567890abcdef1234567890abcdef12345678",
      paymasterData: "0xabcdef",
      isFinal: true, // Should be final for optimized flow
    });

    // Second call - should use cache
    const dataResult = await paymasterHooks.getPaymasterData(testParams);

    // Verify RPC was NOT called again (still just 1 call)
    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1);

    // Verify data result matches
    expect(dataResult).toMatchObject({
      paymaster: "0x1234567890abcdef1234567890abcdef12345678",
      paymasterData: "0xabcdef",
    });
  });

  it("should use cached fee estimates", async () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    // Mock bundler client
    const mockBundlerClient = {
      request: vi.fn().mockImplementation(({ method }) => {
        if (method === "alchemy_requestGasAndPaymasterAndData") {
          return Promise.resolve({
            callGasLimit: "0x5208",
            preVerificationGas: "0x5208",
            verificationGasLimit: "0x5208",
            maxFeePerGas: "0x3b9aca00", // 1 gwei
            maxPriorityFeePerGas: "0xf4240", // 0.001 gwei
            paymasterAndData: "0x1234567890abcdef",
          });
        }
        return Promise.resolve(null);
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    // Make a call to populate cache
    await paymasterHooks.getPaymasterStubData({
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as `0x${string}`,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
      nonce: 0n,
      callData: "0x" as `0x${string}`,
    });

    // Get fee estimates - should use cached values
    const fees = await hooks.userOperation.estimateFeesPerGas({
      bundlerClient: mockBundlerClient as any,
    });

    expect(fees).toEqual({
      maxFeePerGas: 1000000000n, // 1 gwei
      maxPriorityFeePerGas: 1000000n, // 0.001 gwei
    });

    // Should only have called RPC once (for the paymaster data)
    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1);
  });

  it("should invalidate cache for different user operations", async () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    const mockBundlerClient = {
      request: vi.fn().mockResolvedValue({
        callGasLimit: "0x5208",
        preVerificationGas: "0x5208",
        verificationGasLimit: "0x5208",
        maxFeePerGas: "0x3b9aca00",
        maxPriorityFeePerGas: "0xf4240",
        paymasterAndData: "0xabcdef",
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    // First user operation
    await paymasterHooks.getPaymasterStubData({
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as `0x${string}`,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
      nonce: 0n,
      callData: "0x" as `0x${string}`,
    });

    // Different user operation (different nonce)
    await paymasterHooks.getPaymasterStubData({
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as `0x${string}`,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`,
      nonce: 1n, // Different nonce
      callData: "0x" as `0x${string}`,
    });

    // Should have made 2 RPC calls (cache invalidated)
    expect(mockBundlerClient.request).toHaveBeenCalledTimes(2);
  });

  it("should handle complete optimized flow with ERC-20 token context", async () => {
    const policyId = "test-policy-with-token";
    const tokenAddress =
      "0x1234567890abcdef1234567890abcdef12345678" as Address;
    const maxTokenAmount = 1000000n;

    const hooks = alchemyGasManagerHooks(policyId, {
      address: tokenAddress,
      maxTokenAmount,
    });

    // Mock successful RPC response with all fields
    const mockResponse = {
      callGasLimit: "0x5208",
      preVerificationGas: "0x5208",
      verificationGasLimit: "0x5208",
      maxFeePerGas: "0x3b9aca00",
      maxPriorityFeePerGas: "0xf4240",
      paymaster: "0x9876543210abcdef9876543210abcdef98765432" as Address,
      paymasterData: "0xdeadbeef",
      paymasterVerificationGasLimit: "0x30d40", // 200000
      paymasterPostOpGasLimit: "0x7530", // 30000
    };

    const mockBundlerClient = {
      request: vi.fn().mockResolvedValueOnce(mockResponse),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);
    const userOpParams = {
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as Address,
      nonce: 42n,
      callData: "0x12345678" as `0x${string}`,
      context: { customField: "test" },
    };

    // Step 1: getPaymasterStubData should make the RPC call
    const stubResult = await paymasterHooks.getPaymasterStubData(userOpParams);

    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1);
    expect(mockBundlerClient.request).toHaveBeenCalledWith({
      method: "alchemy_requestGasAndPaymasterAndData",
      params: [
        {
          policyId,
          entryPoint: userOpParams.entryPointAddress,
          userOperation: expect.objectContaining({
            sender: userOpParams.sender,
            nonce: toHex(userOpParams.nonce),
            callData: userOpParams.callData,
          }),
          dummySignature: expect.stringMatching(/^0x[a-f0-9]+$/),
          overrides: {},
          erc20Context: {
            tokenAddress,
            maxTokenAmount,
          },
        },
      ],
    });

    expect(stubResult).toEqual({
      paymaster: mockResponse.paymaster,
      paymasterData: mockResponse.paymasterData,
      paymasterVerificationGasLimit: 200000n,
      paymasterPostOpGasLimit: 30000n,
      isFinal: true,
    });

    // Step 2: getPaymasterData should use cached result
    const dataResult = await paymasterHooks.getPaymasterData(userOpParams);

    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(dataResult).toEqual({
      paymaster: mockResponse.paymaster,
      paymasterData: mockResponse.paymasterData,
      paymasterVerificationGasLimit: 200000n,
      paymasterPostOpGasLimit: 30000n,
    });

    // Step 3: estimateFeesPerGas should use cached gas values
    const fees = await hooks.userOperation.estimateFeesPerGas({
      bundlerClient: mockBundlerClient as any,
    });

    expect(mockBundlerClient.request).toHaveBeenCalledTimes(1); // Still only 1 call
    expect(fees).toEqual({
      maxFeePerGas: 1000000000n, // 0x3b9aca00
      maxPriorityFeePerGas: 1000000n, // 0xf4240
    });
  });

  it("should fall back to default estimation when no cached data", async () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    const mockBlock = {
      baseFeePerGas: "0x2540be400", // 10 gwei
    };

    const mockBundlerClient = {
      request: vi.fn().mockImplementation(({ method }) => {
        if (method === "eth_getBlockByNumber") {
          return Promise.resolve(mockBlock);
        }
        if (method === "rundler_maxPriorityFeePerGas") {
          return Promise.resolve("0x5f5e100"); // 0.1 gwei
        }
        return Promise.resolve(null);
      }),
    };

    // Call estimateFeesPerGas without any prior paymaster calls
    const fees = await hooks.userOperation.estimateFeesPerGas({
      bundlerClient: mockBundlerClient as any,
    });

    // Check both calls were made
    expect(mockBundlerClient.request).toHaveBeenCalledTimes(2);

    // Check the methods called
    const callMethods = mockBundlerClient.request.mock.calls.map(
      (call: any[]) => call[0].method,
    );
    expect(callMethods).toContain("eth_getBlockByNumber");
    expect(callMethods).toContain("rundler_maxPriorityFeePerGas");

    // Should calculate: baseFee * 1.5 + priority
    expect(fees).toEqual({
      maxFeePerGas: 15100000000n, // (10 gwei * 1.5) + 0.1 gwei
      maxPriorityFeePerGas: 100000000n, // 0.1 gwei from rundler_maxPriorityFeePerGas
    });
  });

  it("should handle paymasterAndData format in response", async () => {
    const hooks = alchemyGasManagerHooks("test-policy");

    const mockBundlerClient = {
      request: vi.fn().mockResolvedValue({
        callGasLimit: "0x5208",
        preVerificationGas: "0x5208",
        verificationGasLimit: "0x5208",
        maxFeePerGas: "0x3b9aca00",
        maxPriorityFeePerGas: "0xf4240",
        // Using combined paymasterAndData format
        paymasterAndData: "0x9876543210abcdef9876543210abcdef98765432deadbeef",
      }),
    };

    const paymasterHooks = hooks.paymaster(mockBundlerClient as any);

    const stubResult = await paymasterHooks.getPaymasterStubData({
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as Address,
      nonce: 0n,
      callData: "0x" as `0x${string}`,
    });

    expect(stubResult).toEqual({
      paymasterAndData: "0x9876543210abcdef9876543210abcdef98765432deadbeef",
      isFinal: true,
    });

    // getPaymasterData should also return the same format
    const dataResult = await paymasterHooks.getPaymasterData({
      chainId: 1,
      entryPointAddress:
        "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address,
      sender: "0xabcdef1234567890abcdef1234567890abcdef12" as Address,
      nonce: 0n,
      callData: "0x" as `0x${string}`,
    });

    expect(dataResult).toEqual({
      paymasterAndData: "0x9876543210abcdef9876543210abcdef98765432deadbeef",
    });
  });
});

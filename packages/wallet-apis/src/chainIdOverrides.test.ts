import { zeroAddress } from "viem";
import { type AlchemyTransport } from "@alchemy/common";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createSmartWalletClient } from "./client.js";
import { custom } from "viem";

describe("chainId overrides", () => {
  const signer = privateKeyToAccount(
    "0xd7b061ef04d29cf68b3c89356678eccec9988de8d5ed892c19461c4a9d65925d",
  );

  // Track captured requests for verification
  let capturedRequests: Array<{ method: string; params: any[] }> = [];

  const mockTransport = custom({
    async request({ method, params }) {
      // Capture the request for assertion
      capturedRequests.push({ method, params });

      // Return mock responses based on the method
      switch (method) {
        case "wallet_prepareCalls":
          return {
            userOperation: {
              sender: "0x1234567890123456789012345678901234567890",
              nonce: "0x0",
              initCode: "0x",
              callData: "0x",
              callGasLimit: "0x0",
              verificationGasLimit: "0x0",
              preVerificationGas: "0x0",
              maxFeePerGas: "0x0",
              maxPriorityFeePerGas: "0x0",
              paymasterAndData: "0x",
              signature: "0x",
            },
            signatureRequest: {
              type: "personal_sign",
              data: "0x",
            },
          };
        case "wallet_sendPreparedCalls":
          return {
            preparedCallIds: ["test-call-id"],
          };
        case "wallet_prepareSign":
          return {
            signatureRequest: {
              type: "personal_sign",
              data: "0x",
            },
          };
        case "wallet_formatSign":
          return {
            signature: "0x1234567890abcdef",
          };
        case "wallet_createSession":
          return {
            sessionId: "0x1234567890abcdef",
            signatureRequest: {
              type: "personal_sign",
              data: "0x",
            },
          };
        default:
          throw new Error(`Unhandled method: ${method}`);
      }
    },
  });

  beforeEach(() => {
    capturedRequests = [];
  });

  it("should allow overriding the chainId in prepareCalls", async () => {
    const client = createSmartWalletClient({
      transport: mockTransport as unknown as AlchemyTransport,
      chain: arbitrumSepolia,
      signer,
    });

    const overrideChainId = "0x1"; // Ethereum mainnet

    await client.prepareCalls({
      calls: [{ to: zeroAddress, value: "0x0" }],
      from: "0x1234567890123456789012345678901234567890",
      chainId: overrideChainId,
    });

    // Verify the request was captured with the overridden chainId
    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0].method).toBe("wallet_prepareCalls");
    expect(capturedRequests[0].params[0].chainId).toBe(overrideChainId);
  });

  it("should allow overriding the chainId in sendPreparedCalls", async () => {
    const client = createSmartWalletClient({
      transport: mockTransport as unknown as AlchemyTransport,
      chain: arbitrumSepolia,
      signer,
    });

    const overrideChainId = "0x1"; // Ethereum mainnet

    await client.sendPreparedCalls({
      type: "user-operation-v060",
      data: {
        sender: "0x1234567890123456789012345678901234567890",
        nonce: "0x0",
        initCode: "0x",
        callData: "0x",
        callGasLimit: "0x0",
        verificationGasLimit: "0x0",
        preVerificationGas: "0x0",
        maxFeePerGas: "0x0",
        maxPriorityFeePerGas: "0x0",
        paymasterAndData: "0x",
      },
      signature: {
        type: "secp256k1",
        data: "0x1234567890abcdef",
      },
      chainId: overrideChainId,
    });

    // Verify the request was captured with the overridden chainId
    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0].method).toBe("wallet_sendPreparedCalls");
    expect(capturedRequests[0].params[0].chainId).toBe(overrideChainId);
  });

  it("should allow overriding the chainId in grantPermissions", async () => {
    const client = createSmartWalletClient({
      transport: mockTransport as unknown as AlchemyTransport,
      chain: arbitrumSepolia,
      signer,
    });

    const overrideChainId = "0x1"; // Ethereum mainnet

    await client.grantPermissions({
      account: "0x1234567890123456789012345678901234567890",
      expirySec: Math.floor(Date.now() / 1000) + 60 * 60,
      key: {
        publicKey: "0x1234567890123456789012345678901234567890",
        type: "secp256k1",
      },
      permissions: [{ type: "root" }],
      chainId: overrideChainId,
    });

    // Verify the request was captured with the overridden chainId
    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0].method).toBe("wallet_createSession");
    expect(capturedRequests[0].params[0].chainId).toBe(overrideChainId);
  });
});

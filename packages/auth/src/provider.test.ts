import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockedFunction,
} from "vitest";
import { ProviderRpcError } from "viem";
import { create1193Provider } from "./provider.js";
import { AuthSession } from "./authSession.js";
import type { AlchemyAuthEip1193Provider } from "./provider.js";

// Mock fetch function (will be stubbed in beforeEach)
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;

// Mock AuthSession
const mockAuthSession = {
  getAddress: vi.fn(),
  signMessage: vi.fn(),
  signTypedData: vi.fn(),
  disconnect: vi.fn(),
} as unknown as AuthSession;

describe("create1193Provider", () => {
  let provider: AlchemyAuthEip1193Provider;
  const testAddress = "0x1234567890123456789012345678901234567890";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch globally for this test suite
    vi.stubGlobal("fetch", mockFetch);

    // Set up default mock implementations
    (mockAuthSession.getAddress as any).mockReturnValue(testAddress);

    provider = create1193Provider(mockAuthSession);
  });

  afterEach(() => {
    // Clean up global fetch mock
    vi.unstubAllGlobals();
  });

  describe("eth_accounts", () => {
    it("should return the current account address", async () => {
      const result = await provider.request({
        method: "eth_accounts",
      });

      expect(result).toEqual([testAddress]);
      expect(mockAuthSession.getAddress).toHaveBeenCalled();
    });
  });

  describe("eth_requestAccounts", () => {
    it("should return the current account address", async () => {
      const result = await provider.request({
        method: "eth_requestAccounts",
      });

      expect(result).toEqual([testAddress]);
      expect(mockAuthSession.getAddress).toHaveBeenCalled();
    });
  });

  describe("personal_sign", () => {
    const mockSignature = "0xabcdef1234567890";
    const messageData = "0x48656c6c6f20576f726c64"; // "Hello World" in hex

    beforeEach(() => {
      // Mock successful signing response
      mockFetch.mockResolvedValue({
        status: 200,
        json: async () => ({ signature: mockSignature }),
      } as Response);

      (mockAuthSession.signMessage as any).mockResolvedValue(mockSignature);
    });

    it("should sign a message for the current account", async () => {
      const result = await provider.request({
        method: "personal_sign",
        params: [messageData, testAddress],
      });

      expect(result).toBe(mockSignature);
      expect(mockAuthSession.signMessage).toHaveBeenCalledWith({
        message: { raw: messageData },
      });
    });

    it("should throw error when signing for different address", async () => {
      const differentAddress = "0x9876543210987654321098765432109876543210";

      await expect(
        provider.request({
          method: "personal_sign",
          params: [messageData, differentAddress],
        }),
      ).rejects.toThrow(
        "Cannot sign for an address other than the current account.",
      );
    });

    it("should handle signing errors from auth session", async () => {
      const error = new Error("Signing failed");
      (mockAuthSession.signMessage as any).mockRejectedValue(error);

      await expect(
        provider.request({
          method: "personal_sign",
          params: [messageData, testAddress],
        }),
      ).rejects.toThrow("Signing failed");
    });
  });

  describe("eth_signTypedData_v4", () => {
    const mockSignature = "0xabcdef1234567890";
    const typedDataJson = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
      },
      primaryType: "Person",
      domain: {
        name: "Test App",
        version: "1",
      },
      message: {
        name: "Alice",
        wallet: testAddress,
      },
    });

    beforeEach(() => {
      // Mock successful signing response
      mockFetch.mockResolvedValue({
        status: 200,
        json: async () => ({ signature: mockSignature }),
      } as Response);

      (mockAuthSession.signTypedData as any).mockResolvedValue(mockSignature);
    });

    it("should sign typed data for the current account", async () => {
      const result = await provider.request({
        method: "eth_signTypedData_v4",
        params: [testAddress, typedDataJson],
      });

      expect(result).toBe(mockSignature);
      expect(mockAuthSession.signTypedData).toHaveBeenCalledWith(
        JSON.parse(typedDataJson),
      );
    });

    it("should throw error when signing for different address", async () => {
      const differentAddress = "0x9876543210987654321098765432109876543210";

      await expect(
        provider.request({
          method: "eth_signTypedData_v4",
          params: [differentAddress, typedDataJson],
        }),
      ).rejects.toThrow(
        "Cannot sign for an address other than the current account.",
      );
    });

    it("should handle signing errors from auth session", async () => {
      const error = new Error("Signing failed");
      (mockAuthSession.signTypedData as any).mockRejectedValue(error);

      await expect(
        provider.request({
          method: "eth_signTypedData_v4",
          params: [testAddress, typedDataJson],
        }),
      ).rejects.toThrow("Signing failed");
    });
  });

  describe("eth_sign", () => {
    const mockSignature = "0xabcdef1234567890";
    const messageData = "0x48656c6c6f20576f726c64";

    beforeEach(() => {
      // Mock successful signing response
      mockFetch.mockResolvedValue({
        status: 200,
        json: async () => ({ signature: mockSignature }),
      } as Response);

      (mockAuthSession.signMessage as any).mockResolvedValue(mockSignature);
    });

    it("should sign data for the current account", async () => {
      const result = await provider.request({
        method: "eth_sign",
        params: [testAddress, messageData],
      });

      expect(result).toBe(mockSignature);
      expect(mockAuthSession.signMessage).toHaveBeenCalledWith({
        message: { raw: messageData },
      });
    });

    it("should throw error when signing for different address", async () => {
      const differentAddress = "0x9876543210987654321098765432109876543210";

      await expect(
        provider.request({
          method: "eth_sign",
          params: [differentAddress, messageData],
        }),
      ).rejects.toThrow(
        "Cannot sign for an address other than the current account.",
      );
    });

    it("should handle signing errors from auth session", async () => {
      const error = new Error("Signing failed");
      (mockAuthSession.signMessage as any).mockRejectedValue(error);

      await expect(
        provider.request({
          method: "eth_sign",
          params: [testAddress, messageData],
        }),
      ).rejects.toThrow("Signing failed");
    });
  });

  describe("wallet_disconnect", () => {
    it("should disconnect the auth session and emit disconnect event", async () => {
      const disconnectSpy = vi.fn();
      provider.on("disconnect", disconnectSpy);

      await provider.request({
        method: "wallet_disconnect",
      });

      expect(mockAuthSession.disconnect).toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should handle disconnect errors", async () => {
      const error = new Error("Disconnect failed");
      (mockAuthSession.disconnect as any).mockRejectedValue(error);

      await expect(
        provider.request({
          method: "wallet_disconnect",
        }),
      ).rejects.toThrow("Disconnect failed");
    });
  });

  describe("unsupported methods", () => {
    it("should throw MethodUnsupportedError for unsupported methods", async () => {
      await expect(
        provider.request({
          method: "eth_sendTransaction" as any,
          params: [] as any,
        }),
      ).rejects.toThrow("Unsupported method");
    });
  });

  describe("error types and RPC codes", () => {
    it("should throw ProviderRpcError with code -32600 for invalid address", async () => {
      const differentAddress = "0x9876543210987654321098765432109876543210";

      try {
        await provider.request({
          method: "personal_sign",
          params: ["0x123", differentAddress],
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderRpcError);
        expect((error as ProviderRpcError).code).toBe(-32600);
        expect((error as Error).message).toContain(
          "Cannot sign for an address other than the current account.",
        );
      }
    });

    it("should throw ProviderRpcError with code -32601 for unsupported method", async () => {
      try {
        await provider.request({
          method: "eth_sendTransaction" as any,
          params: [] as any,
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderRpcError);
        expect((error as ProviderRpcError).code).toBe(-32601);
        expect((error as Error).message).toContain(
          "Unsupported method: eth_sendTransaction",
        );
      }
    });

    it("should throw ProviderRpcError with code -32603 for unexpected errors", async () => {
      const unexpectedError = new Error("Something went wrong");
      (mockAuthSession.signMessage as any).mockRejectedValue(unexpectedError);

      try {
        await provider.request({
          method: "personal_sign",
          params: ["0x123", testAddress],
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderRpcError);
        expect((error as ProviderRpcError).code).toBe(-32603);
        expect((error as Error).message).toContain("Something went wrong");
      }
    });
  });
});

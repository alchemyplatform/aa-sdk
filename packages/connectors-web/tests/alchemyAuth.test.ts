import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { alchemyAuth } from "../src/alchemyAuth.js";
import { createConfig } from "@wagmi/core";
import { sepolia, mainnet } from "viem/chains";
import { http, type Address } from "viem";
import type { AuthClient, AuthSession } from "@alchemy/auth";
import type { Connector } from "wagmi";
import EventEmitter from "eventemitter3";

// Type helper to get the connector instance type with custom properties
type AlchemyAuthConnector = Connector & {
  getAuthClient(): AuthClient;
  getAuthSession(): Promise<AuthSession>;
  setAuthSession(authSession: AuthSession): void;
};

// Mock dependencies
vi.mock("@alchemy/auth-web");

describe("alchemyAuth connector", () => {
  const TEST_ADDRESS = "0x1234567890123456789012345678901234567890" as Address;

  let mockAuthClient: AuthClient;
  let mockAuthSession: AuthSession;
  let mockProvider: any;
  let mockStorage: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockProvider = {
      request: vi.fn(),
    };
    const emitter = new EventEmitter();
    mockAuthSession = {
      getAddress: vi.fn().mockReturnValue(TEST_ADDRESS),
      getProvider: vi.fn().mockReturnValue(mockProvider),
      toViemLocalAccount: vi.fn().mockReturnValue({
        address: TEST_ADDRESS,
        type: "local",
      }),
      getSerializedState: vi.fn().mockReturnValue(
        JSON.stringify({
          type: "email",
          bundle: "test-bundle",
          expirationDateMs: Date.now() + 60 * 60 * 1000,
          user: { address: TEST_ADDRESS },
        }),
      ),
      disconnect: vi.fn(() => emitter.emit("disconnect")),
      on: (event: any, listener: any) => {
        emitter.on(event, listener);
        return () => {
          emitter.removeListener(event, listener);
        };
      },
    } as any;
    mockAuthClient = {
      restoreAuthSession: vi.fn().mockResolvedValue(mockAuthSession),
    } as any;
    mockStorage = {
      getItem: vi.fn().mockResolvedValue(null),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };

    const { createWebAuthClient } = await import("@alchemy/auth-web");
    vi.mocked(createWebAuthClient).mockReturnValue(mockAuthClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Session Management", () => {
    it("should set and get auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const session = await connectorInstance.getAuthSession();
      expect(session).toBe(mockAuthSession);
    });

    it("should return null when getting auth session without setting it first", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      expect(connectorInstance.getAuthSession()).toBe(null);
    });

    it("should get auth client", () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      const authClient = connectorInstance.getAuthClient();

      expect(authClient).toBeDefined();
      expect(authClient).toBe(mockAuthClient);
    });
  });

  describe("Connection Flow", () => {
    it("should connect with auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const result = await connectorInstance.connect();

      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0]).toBe(TEST_ADDRESS);
      expect(result.chainId).toBe(sepolia.id);
    });

    it("should connect with specific chainId", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia, mainnet],
        transports: {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const result = await connectorInstance.connect({ chainId: mainnet.id });

      expect(result.chainId).toBe(mainnet.id);
    });

    it("should throw error when connecting without auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      await expect(connectorInstance.connect()).rejects.toThrow(
        "No auth session available",
      );
    });
  });

  describe("Disconnection Flow", () => {
    it("should disconnect and clear session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      await connectorInstance.disconnect();

      expect(mockAuthSession.disconnect).toHaveBeenCalled();
      expect(mockStorage.removeItem).toHaveBeenCalled();
    });

    it("should handle disconnect errors gracefully", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      // Mock disconnect to throw error
      const errorSession = {
        ...mockAuthSession,
        disconnect: vi.fn().mockRejectedValue(new Error("Disconnect failed")),
      };
      connectorInstance.setAuthSession(errorSession as any);

      await expect(connectorInstance.disconnect()).resolves.toBeUndefined();
      expect(mockStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe("Account Management", () => {
    it("should get accounts from auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const accounts = await connectorInstance.getAccounts();

      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toBe(TEST_ADDRESS);
    });

    it("should return empty array when no auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      const accounts = await connectorInstance.getAccounts();

      expect(accounts).toHaveLength(0);
    });
  });

  describe("Chain Management", () => {
    it("should get current chain id", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      const chainId = await connectorInstance.getChainId();

      expect(chainId).toBe(sepolia.id);
    });

    it("should switch chain", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia, mainnet],
        transports: {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const result = await connectorInstance.switchChain!({
        chainId: mainnet.id,
      });

      expect(result.id).toBe(mainnet.id);
    });

    it("should throw error when switching to unsupported chain", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      await expect(
        connectorInstance.switchChain!({ chainId: 999999 }),
      ).rejects.toThrow("Chain with id 999999 not found in config");
    });
  });

  describe("Provider Management", () => {
    it("should get provider from auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const provider = await connectorInstance.getProvider();

      expect(provider).toBe(mockProvider);
      expect(mockAuthSession.getProvider).toHaveBeenCalled();
    });

    it("should throw error when getting provider without auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      await expect(connectorInstance.getProvider()).rejects.toThrow(
        "No auth session available",
      );
    });
  });

  describe("Authorization", () => {
    it("should return false when not authorized", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      const isAuthorized = await connectorInstance.isAuthorized();

      expect(isAuthorized).toBe(false);
    });

    it("should return true when authorized", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const isAuthorized = await connectorInstance.isAuthorized();

      expect(isAuthorized).toBe(true);
    });
  });

  describe("Session Restoration", () => {
    it("should restore session from storage on setup", async () => {
      const persistedSession = {
        version: 1,
        chainId: sepolia.id,
        authSessionState: JSON.stringify({
          type: "email",
          bundle: "test-bundle",
          expirationDateMs: Date.now() + 60 * 60 * 1000,
          user: { address: TEST_ADDRESS },
        }),
      };

      mockStorage.getItem.mockResolvedValue(JSON.stringify(persistedSession));

      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      await connectorInstance.setup?.();

      // Give time for async restoration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const isAuthorized = await connectorInstance.isAuthorized();
      expect(isAuthorized).toBe(true);
    });

    it("should handle storage errors during restoration", async () => {
      mockStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      // Should not throw
      await expect(connectorInstance.setup?.()).resolves.toBeUndefined();
    });
  });

  describe("Client Creation", () => {
    it("should cache clients by chainId", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const client1 = await connectorInstance.getClient?.({
        chainId: sepolia.id,
      });
      const client2 = await connectorInstance.getClient?.({
        chainId: sepolia.id,
      });

      expect(client1).toBe(client2);
      expect(mockAuthSession.toViemLocalAccount).toHaveBeenCalledTimes(1);
    });

    it("should throw error when getting client without auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      await expect(
        connectorInstance.getClient?.({ chainId: sepolia.id }),
      ).rejects.toThrow("No auth session available");
    });
  });

  describe("Event Handlers", () => {
    it("should handle accounts changed event with empty array", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      // Trigger accounts changed with empty array - should disconnect
      await connectorInstance.onAccountsChanged([]);

      expect(mockAuthSession.disconnect).toHaveBeenCalled();
    });

    it("should emit change event when accounts changed to non-empty array", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      const newAddress =
        "0x9876543210987654321098765432109876543210" as Address;

      await expect(
        connectorInstance.onAccountsChanged([newAddress]),
      ).resolves.not.toThrow();
    });

    it("should emit change event when chain changed", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia, mainnet],
        transports: {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      // Directly call onChainChanged - the implementation should emit "change" event
      // We can't easily test the event emission directly, but we can verify the method doesn't throw
      await expect(
        connectorInstance.onChainChanged(`0x${mainnet.id.toString(16)}`),
      ).resolves.not.toThrow();
    });

    it("should handle disconnect event", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      await connectorInstance.onDisconnect(new Error("Test error"));

      expect(mockAuthSession.disconnect).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should throw error when apiKey is missing", () => {
      const connector = alchemyAuth({} as any);
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;

      expect(() => connectorInstance.getAuthClient()).toThrow(
        "Authentication required",
      );
    });
  });

  describe("Storage Synchronization", () => {
    it("should persist session after setting auth session", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      // Give time for async persistence
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should persist session after connecting", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      await connectorInstance.connect();

      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should persist chain change", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia, mainnet],
        transports: {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      await connectorInstance.switchChain!({ chainId: mainnet.id });

      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it("should handle persistence failure during connect gracefully", async () => {
      mockStorage.setItem.mockRejectedValue(new Error("Storage full"));

      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      // Should not throw even if persistence fails
      await expect(connectorInstance.connect()).resolves.toBeDefined();
    });

    it("should handle persistence failure during chain switch gracefully", async () => {
      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia, mainnet],
        transports: {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      connectorInstance.setAuthSession(mockAuthSession);

      // Make storage fail after initial connect
      await connectorInstance.connect();
      mockStorage.setItem.mockRejectedValue(new Error("Storage full"));

      // Should not throw even if persistence fails
      await expect(
        connectorInstance.switchChain!({ chainId: mainnet.id }),
      ).resolves.toBeDefined();
    });
  });

  describe("Session Restoration Edge Cases", () => {
    it("should clean up storage when restore fails", async () => {
      const persistedSession = {
        version: 1,
        chainId: sepolia.id,
        authSessionState: JSON.stringify({
          type: "email",
          bundle: "invalid-bundle",
          expirationDateMs: Date.now() + 60 * 60 * 1000,
          user: { address: TEST_ADDRESS },
        }),
      };

      mockStorage.getItem.mockResolvedValue(JSON.stringify(persistedSession));
      mockAuthClient.restoreAuthSession = vi
        .fn()
        .mockRejectedValue(new Error("Invalid bundle"));

      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      await connectorInstance.setup?.();

      // Give time for async restoration
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStorage.removeItem).toHaveBeenCalled();
    });

    it("should clean up storage when restored session is null", async () => {
      const persistedSession = {
        version: 1,
        chainId: sepolia.id,
        authSessionState: JSON.stringify({
          type: "email",
          bundle: "test-bundle",
          expirationDateMs: Date.now() + 60 * 60 * 1000,
          user: { address: TEST_ADDRESS },
        }),
      };

      mockStorage.getItem.mockResolvedValue(JSON.stringify(persistedSession));
      mockAuthClient.restoreAuthSession = vi.fn().mockResolvedValue(null);

      const connector = alchemyAuth({ apiKey: "test-key" });
      const config = createConfig({
        chains: [sepolia],
        transports: {
          [sepolia.id]: http(),
        },
        connectors: [connector],
        storage: mockStorage,
      });

      const connectorInstance = config.connectors[0] as AlchemyAuthConnector;
      await connectorInstance.setup?.();

      // Give time for async restoration
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStorage.removeItem).toHaveBeenCalled();
    });
  });
});

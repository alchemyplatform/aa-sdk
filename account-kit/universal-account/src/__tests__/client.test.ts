/**
 * Unit tests for UniversalAccountClient
 *
 * These tests verify the wrapper logic around the Particle Network SDK.
 * They use mocks to test that:
 * - Parameters are correctly passed to the underlying SDK
 * - Responses are correctly mapped to our types
 * - The client API behaves as expected
 *
 * NOTE: These are unit tests, not integration tests. They do NOT verify
 * actual Particle SDK behavior or network calls. For integration testing,
 * use the demo app in examples/next-example which tests the full flow
 * with real SDK calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UniversalAccountClient } from "../client.js";
import type { Address } from "viem";

// Mock the Particle SDK - we test our wrapper logic, not the SDK itself
vi.mock("@particle-network/universal-account-sdk", () => ({
  UniversalAccount: vi.fn(),
}));

describe("UniversalAccountClient", () => {
  const mockOwnerAddress: Address =
    "0x1234567890123456789012345678901234567890";
  const mockSmartAccountAddress: Address =
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  const mockSolanaAddress = "SoLaNaAddReSs123456789012345678901234567890123";

  const mockSmartAccountOptions = {
    name: "UniversalAccount",
    version: "1.0.0",
    ownerAddress: mockOwnerAddress,
    smartAccountAddress: mockSmartAccountAddress,
    solanaSmartAccountAddress: mockSolanaAddress,
    senderAddress: mockSmartAccountAddress,
    senderSolanaAddress: mockSolanaAddress,
  };

  const mockPrimaryAssets = {
    assets: [
      {
        tokenType: "ETH",
        price: 2000,
        amount: "1.5",
        amountInUSD: 3000,
        chainAggregation: [
          {
            token: {
              chainId: 1,
              address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
            },
            amount: "1.0",
            amountInUSD: 2000,
            rawAmount: "1000000000000000000",
          },
          {
            token: {
              chainId: 42161,
              address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
            },
            amount: "0.5",
            amountInUSD: 1000,
            rawAmount: "500000000000000000",
          },
        ],
      },
    ],
    totalAmountInUSD: 3000,
  };

  let mockUa: any;
  let client: UniversalAccountClient;

  beforeEach(() => {
    mockUa = {
      getSmartAccountOptions: vi
        .fn()
        .mockResolvedValue(mockSmartAccountOptions),
      getPrimaryAssets: vi.fn().mockResolvedValue(mockPrimaryAssets),
      createTransferTransaction: vi.fn(),
      createUniversalTransaction: vi.fn(),
      createBuyTransaction: vi.fn(),
      createSellTransaction: vi.fn(),
      createConvertTransaction: vi.fn(),
      sendTransaction: vi.fn(),
    };

    client = new UniversalAccountClient(mockUa, mockOwnerAddress);
  });

  describe("getOwnerAddress", () => {
    it("returns the owner address", () => {
      expect(client.getOwnerAddress()).toBe(mockOwnerAddress);
    });
  });

  describe("getSmartAccountOptions", () => {
    it("returns smart account options with correct types", async () => {
      const options = await client.getSmartAccountOptions();

      expect(options.name).toBe("UniversalAccount");
      expect(options.version).toBe("1.0.0");
      expect(options.ownerAddress).toBe(mockOwnerAddress);
      expect(options.smartAccountAddress).toBe(mockSmartAccountAddress);
      expect(options.solanaSmartAccountAddress).toBe(mockSolanaAddress);
    });
  });

  describe("getAddress", () => {
    it("returns the EVM smart account address", async () => {
      const address = await client.getAddress();
      expect(address).toBe(mockSmartAccountAddress);
    });
  });

  describe("getSolanaAddress", () => {
    it("returns the Solana smart account address", async () => {
      const address = await client.getSolanaAddress();
      expect(address).toBe(mockSolanaAddress);
    });
  });

  describe("getPrimaryAssets", () => {
    it("returns formatted primary assets", async () => {
      const assets = await client.getPrimaryAssets();

      expect(assets.totalAmountInUSD).toBe(3000);
      expect(assets.assets).toHaveLength(1);
      expect(assets.assets[0].tokenType).toBe("ETH");
      expect(assets.assets[0].chainAggregation).toHaveLength(2);
    });

    it("correctly maps chain aggregation data", async () => {
      const assets = await client.getPrimaryAssets();
      const ethAsset = assets.assets[0];

      expect(ethAsset.chainAggregation[0].chainId).toBe(1);
      expect(ethAsset.chainAggregation[0].amount).toBe("1.0");
      expect(ethAsset.chainAggregation[1].chainId).toBe(42161);
    });
  });

  describe("createTransferTransaction", () => {
    it("calls underlying SDK with correct params", async () => {
      const mockTx = {
        type: "universal",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: "0x9999999999999999999999999999999999999999",
        transactionId: "tx-123",
        rootHash: "0xabcd1234",
        smartAccountOptions: mockSmartAccountOptions,
        feeQuotes: [],
      };
      mockUa.createTransferTransaction.mockResolvedValue(mockTx);

      const params = {
        token: {
          chainId: 42161,
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as Address,
        },
        amount: "10",
        receiver: "0x9999999999999999999999999999999999999999" as Address,
      };

      const tx = await client.createTransferTransaction(params);

      expect(mockUa.createTransferTransaction).toHaveBeenCalledWith({
        token: { chainId: 42161, address: params.token.address },
        amount: "10",
        receiver: params.receiver,
      });
      expect(tx.transactionId).toBe("tx-123");
      expect(tx.rootHash).toBe("0xabcd1234");
    });
  });

  describe("createUniversalTransaction", () => {
    it("calls underlying SDK with correct params", async () => {
      const mockTx = {
        type: "universal",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: mockSmartAccountAddress,
        transactionId: "tx-456",
        rootHash: "0xdef456",
        smartAccountOptions: mockSmartAccountOptions,
        feeQuotes: [],
      };
      mockUa.createUniversalTransaction.mockResolvedValue(mockTx);

      const params = {
        chainId: 8453,
        expectTokens: [{ type: "ETH", amount: "0.01" }],
        transactions: [
          {
            to: "0x1111111111111111111111111111111111111111" as Address,
            data: "0x1234" as `0x${string}`,
          },
        ],
      };

      const tx = await client.createUniversalTransaction(params);

      expect(mockUa.createUniversalTransaction).toHaveBeenCalledWith({
        chainId: 8453,
        expectTokens: [{ type: "ETH", amount: "0.01" }],
        transactions: [
          { to: params.transactions[0].to, data: "0x1234", value: undefined },
        ],
      });
      expect(tx.transactionId).toBe("tx-456");
    });
  });

  describe("sendTransaction", () => {
    it("sends transaction with signature and returns result", async () => {
      const mockResult = {
        transactionId: "tx-789",
        status: "pending",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: "0x9999999999999999999999999999999999999999",
        tag: "transfer",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      mockUa.sendTransaction.mockResolvedValue(mockResult);

      const mockTx = { rootHash: "0xabc" } as any;
      const signature = "0xsignature";

      const result = await client.sendTransaction(mockTx, signature);

      expect(mockUa.sendTransaction).toHaveBeenCalledWith(mockTx, signature);
      expect(result.transactionId).toBe("tx-789");
      expect(result.status).toBe("pending");
    });
  });

  describe("getExplorerUrl", () => {
    it("returns correct UniversalX explorer URL", () => {
      const url = client.getExplorerUrl("tx-123");
      expect(url).toBe("https://universalx.app/activity/details?id=tx-123");
    });
  });

  describe("getUnderlyingAccount", () => {
    it("returns the underlying Particle UA instance", () => {
      const ua = client.getUnderlyingAccount();
      expect(ua).toBe(mockUa);
    });
  });

  describe("createBuyTransaction", () => {
    it("calls underlying SDK with correct params", async () => {
      const mockTx = {
        type: "universal",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: mockSmartAccountAddress,
        transactionId: "tx-buy-123",
        rootHash: "0xbuy123",
        smartAccountOptions: mockSmartAccountOptions,
        feeQuotes: [],
      };
      mockUa.createBuyTransaction.mockResolvedValue(mockTx);

      const params = {
        token: {
          chainId: 42161,
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as Address,
        },
        amountInUSD: "10",
      };

      const tx = await client.createBuyTransaction(params);

      expect(mockUa.createBuyTransaction).toHaveBeenCalledWith({
        token: { chainId: 42161, address: params.token.address },
        amountInUSD: "10",
      });
      expect(tx.transactionId).toBe("tx-buy-123");
    });
  });

  describe("createSellTransaction", () => {
    it("calls underlying SDK with correct params", async () => {
      const mockTx = {
        type: "universal",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: mockSmartAccountAddress,
        transactionId: "tx-sell-123",
        rootHash: "0xsell123",
        smartAccountOptions: mockSmartAccountOptions,
        feeQuotes: [],
      };
      mockUa.createSellTransaction.mockResolvedValue(mockTx);

      const params = {
        token: {
          chainId: 42161,
          address: "0x912CE59144191C1204E64559FE8253a0e49E6548" as Address,
        },
        amount: "0.1",
      };

      const tx = await client.createSellTransaction(params);

      expect(mockUa.createSellTransaction).toHaveBeenCalledWith({
        token: { chainId: 42161, address: params.token.address },
        amount: "0.1",
      });
      expect(tx.transactionId).toBe("tx-sell-123");
    });
  });

  describe("createConvertTransaction", () => {
    it("calls underlying SDK with correct params", async () => {
      const mockTx = {
        type: "universal",
        mode: "mainnet",
        sender: mockSmartAccountAddress,
        receiver: mockSmartAccountAddress,
        transactionId: "tx-convert-123",
        rootHash: "0xconvert123",
        smartAccountOptions: mockSmartAccountOptions,
        feeQuotes: [],
      };
      mockUa.createConvertTransaction.mockResolvedValue(mockTx);

      const params = {
        expectToken: { type: "USDC", amount: "1" },
        chainId: 42161,
      };

      const tx = await client.createConvertTransaction(params);

      expect(mockUa.createConvertTransaction).toHaveBeenCalledWith({
        expectToken: { type: "USDC", amount: "1" },
        chainId: 42161,
      });
      expect(tx.transactionId).toBe("tx-convert-123");
    });
  });
});

describe("createUniversalAccountClient", () => {
  it("creates a client with the Particle SDK", async () => {
    const { UniversalAccount } = await import(
      "@particle-network/universal-account-sdk"
    );

    const mockUaInstance = {
      getSmartAccountOptions: vi.fn(),
    };
    (UniversalAccount as any).mockImplementation(() => mockUaInstance);

    const { createUniversalAccountClient } = await import("../client.js");

    const client = await createUniversalAccountClient({
      ownerAddress: "0x1234567890123456789012345678901234567890",
      config: {
        projectId: "test-project-id",
        projectClientKey: "test-client-key",
        projectAppUuid: "test-app-uuid",
      },
    });

    expect(UniversalAccount).toHaveBeenCalledWith({
      projectId: "test-project-id",
      projectClientKey: "test-client-key",
      projectAppUuid: "test-app-uuid",
      ownerAddress: "0x1234567890123456789012345678901234567890",
      tradeConfig: undefined,
    });
    expect(client).toBeInstanceOf(UniversalAccountClient);
  });
});

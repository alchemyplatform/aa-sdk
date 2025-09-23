import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthSession } from "../src/authSession.js";
import type { User, TurnkeyStamper } from "../src/types.js";
import type { AlchemyRestClient } from "@alchemy/common";
import type { SignerHttpSchema } from "@alchemy/aa-infra";

// Mock Turnkey client
vi.mock("@turnkey/http", () => ({
  TurnkeyClient: vi.fn().mockImplementation(() => ({
    stampGetWhoami: vi.fn().mockResolvedValue({
      organizationId: "test-org-id",
      userId: "test-user-id",
    }),
    stamper: {},
  })),
}));

describe("AuthSession", () => {
  let mockTurnkeyStamper: TurnkeyStamper;
  let mockUser: User;
  let mockSignerHttpClient: AlchemyRestClient<SignerHttpSchema>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockTurnkeyStamper = {
      stamp: vi.fn().mockResolvedValue({
        stampHeaderName: "X-Stamp",
        stampHeaderValue: "mock-stamp",
      }),
      clear: vi.fn(),
    };

    mockUser = {
      email: "test@example.com",
      orgId: "test-org-id",
      userId: "test-user-id",
      address: "0x1234567890123456789012345678901234567890",
      solanaAddress: "11111111111111111111111111111111",
      credentialId: "test-credential-id",
      idToken: "test-id-token",
      claims: { sub: "test-user-id" },
    };

    mockSignerHttpClient = {
      request: vi.fn(),
    } as any;

    vi.mocked(mockSignerHttpClient.request).mockImplementation(
      async (params) => {
        if (params.route === "signer/v1/whoami") {
          return mockUser;
        }
        throw new Error(`Unexpected route: ${params.route}`);
      },
    );
  });

  describe("getSerializedState", () => {
    it("should serialize OAuth session state correctly", async () => {
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-oauth-bundle",
        authType: "oauth",
      });

      const serializedState = authSession.getSerializedState();
      const parsedState = JSON.parse(serializedState);

      expect(parsedState).toEqual({
        type: "oauth",
        bundle: "test-oauth-bundle",
        user: expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
          idToken: mockUser.idToken,
        }),
        expirationDateMs: expect.any(Number),
      });

      // Verify expiration is ~24 hours from now
      const now = Date.now();
      const expectedExpiration = now + 24 * 60 * 60 * 1000;
      expect(parsedState.expirationDateMs).toBeGreaterThan(now);
      expect(parsedState.expirationDateMs).toBeLessThanOrEqual(
        expectedExpiration + 1000,
      ); // 1s tolerance
    });

    it("should serialize OTP session state correctly", async () => {
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-otp-bundle",
        authType: "otp",
      });

      const serializedState = authSession.getSerializedState();
      const parsedState = JSON.parse(serializedState);

      expect(parsedState).toEqual({
        type: "otp",
        bundle: "test-otp-bundle",
        user: expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
          idToken: mockUser.idToken,
        }),
        expirationDateMs: expect.any(Number),
      });
    });

    it("should serialize passkey session state correctly", async () => {
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "passkey",
        credentialId: "test-passkey-credential-id",
      });

      const serializedState = authSession.getSerializedState();
      const parsedState = JSON.parse(serializedState);

      expect(parsedState).toEqual({
        type: "passkey",
        user: expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
          idToken: mockUser.idToken,
          credentialId: "test-passkey-credential-id",
        }),
        expirationDateMs: expect.any(Number),
        credentialId: "test-passkey-credential-id",
      });

      // Passkey state should not have a bundle
      expect(parsedState).not.toHaveProperty("bundle");
    });

    it("should throw error when trying to serialize non-passkey auth without bundle", async () => {
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "oauth",
        // No bundle provided
      });

      expect(() => authSession.getSerializedState()).toThrow(
        "Bundle is required for non-passkey authentication types",
      );
    });
  });
});

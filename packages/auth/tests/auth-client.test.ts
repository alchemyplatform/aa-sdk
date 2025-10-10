import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthClient } from "../src/authClient.js";
import { AuthSession } from "../src/authSession.js";
import type {
  AuthSessionState,
  User,
  TurnkeyTekStamper,
  TurnkeyStamper,
  CreateTekStamperFn,
  CreateWebAuthnStamperFn,
  HandleOauthFlowFn,
} from "../src/types.js";
import { DEFAULT_SESSION_EXPIRATION_MS } from "../src/utils.js";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import type { AlchemyRestClient } from "@alchemy/common";
import { TurnkeyClient } from "@turnkey/http";

describe("AuthClient", () => {
  let authClient: AuthClient;
  let mockCreateTekStamper: CreateTekStamperFn;
  let mockCreateWebAuthnStamper: CreateWebAuthnStamperFn;
  let mockHandleOauthFlow: HandleOauthFlowFn;
  let mockTekStamper: TurnkeyTekStamper;
  let mockWebAuthnStamper: TurnkeyStamper;
  let mockUser: User;
  let mockSignerHttpClient: AlchemyRestClient<SignerHttpSchema>;

  beforeEach(async () => {
    vi.clearAllMocks();

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

    mockTekStamper = {
      stamp: vi.fn().mockResolvedValue({
        stampHeaderName: "X-Stamp",
        stampHeaderValue: "mock-stamp",
      }),
      clear: vi.fn(),
      init: vi.fn().mockResolvedValue("mock-public-key"),
      injectCredentialBundle: vi.fn().mockResolvedValue(true),
    };

    mockWebAuthnStamper = {
      stamp: vi.fn().mockResolvedValue({
        stampHeaderName: "X-Stamp",
        stampHeaderValue: "mock-webauthn-stamp",
      }),
      clear: vi.fn(),
    };

    mockCreateTekStamper = vi.fn().mockResolvedValue(mockTekStamper);
    mockCreateWebAuthnStamper = vi.fn().mockResolvedValue(mockWebAuthnStamper);
    mockHandleOauthFlow = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      bundle: "test-oauth-bundle",
      orgId: "test-org-id",
      idToken: "test-id-token",
    });

    mockSignerHttpClient = {
      request: vi.fn(),
    } as any;

    vi.mocked(mockSignerHttpClient.request).mockImplementation(
      async (params) => {
        if (params.route === "signer/v1/whoami") {
          return mockUser;
        }
        throw new Error(`Unexpected route: ${params.route}`);
      }
    );

    authClient = new (AuthClient as any)(
      mockSignerHttpClient,
      mockCreateTekStamper,
      mockCreateWebAuthnStamper,
      mockHandleOauthFlow
    );
  });

  describe("restoreAuthSession", () => {
    it("should load valid OAuth session state", async () => {
      const validOAuthState: AuthSessionState = {
        type: "oauth",
        bundle: "test-oauth-bundle",
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        user: mockUser,
      };

      const authSession = await authClient.restoreAuthSession(
        JSON.stringify(validOAuthState)
      );

      expect(authSession).toBeInstanceOf(AuthSession);
      expect(authSession?.getUser()).toEqual(
        expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
        })
      );

      // Verify the TEK stamper was created and bundle was injected
      expect(mockCreateTekStamper).toHaveBeenCalled();
      expect(mockTekStamper.injectCredentialBundle).toHaveBeenCalledWith(
        "test-oauth-bundle"
      );
    });

    it("should load valid OTP session state", async () => {
      const validOtpState: AuthSessionState = {
        type: "otp",
        bundle: "test-otp-bundle",
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        user: mockUser,
      };

      const authSession = await authClient.restoreAuthSession(
        JSON.stringify(validOtpState)
      );

      expect(authSession).toBeInstanceOf(AuthSession);
      expect(authSession?.getUser()).toEqual(
        expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
        })
      );

      // Verify the TEK stamper was created and bundle was injected
      expect(mockCreateTekStamper).toHaveBeenCalled();
      expect(mockTekStamper.injectCredentialBundle).toHaveBeenCalledWith(
        "test-otp-bundle"
      );
    });

    it("should load valid email session state", async () => {
      const validEmailState: AuthSessionState = {
        type: "email",
        bundle: "test-email-bundle",
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        user: mockUser,
      };

      const authSession = await authClient.restoreAuthSession(
        JSON.stringify(validEmailState)
      );

      expect(authSession).toBeInstanceOf(AuthSession);
      expect(authSession?.getUser()).toEqual(
        expect.objectContaining({
          orgId: mockUser.orgId,
          userId: mockUser.userId,
          address: mockUser.address,
        })
      );

      // Verify the TEK stamper was created and bundle was injected
      expect(mockCreateTekStamper).toHaveBeenCalled();
      expect(mockTekStamper.injectCredentialBundle).toHaveBeenCalledWith(
        "test-email-bundle"
      );
    });

    it("should load valid passkey session state", async () => {
      const expirationDateMs = Date.now() + 60 * 60 * 1000; // 1 hour from now
      // Mock the loginWithPasskey method to avoid the "not implemented" error
      const mockLoginWithPasskey = vi.spyOn(authClient, "loginWithPasskey");
      const mockTurnkeyClient = new TurnkeyClient(
        { baseUrl: "https://api.turnkey.com" },
        mockWebAuthnStamper
      );
      const mockAuthSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "passkey",
        credentialId: "test-passkey-credential",
        expirationDateMs,
      });
      mockLoginWithPasskey.mockResolvedValue(mockAuthSession);

      const validPasskeyState: AuthSessionState = {
        type: "passkey",
        user: mockUser,
        expirationDateMs,
        credentialId: "test-passkey-credential",
      };

      const authSession = await authClient.restoreAuthSession(
        JSON.stringify(validPasskeyState)
      );

      expect(authSession).toBeInstanceOf(AuthSession);
      expect(mockLoginWithPasskey).toHaveBeenCalledWith({
        credentialId: "test-passkey-credential",
      });

      mockLoginWithPasskey.mockRestore();
    });

    it("should throw error for passkey state without credentialId", async () => {
      const invalidPasskeyState: AuthSessionState = {
        type: "passkey",
        user: mockUser,
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        // Missing credentialId
      };

      await expect(
        authClient.restoreAuthSession(JSON.stringify(invalidPasskeyState))
      ).rejects.toThrow("Credential ID is required for passkey authentication");
    });

    it("should return undefined for expired session state", async () => {
      const expiredState: AuthSessionState = {
        type: "oauth",
        bundle: "test-bundle",
        expirationDateMs: Date.now() - 60 * 60 * 1000, // 1 hour ago
        user: mockUser,
      };

      const authSession = await authClient.restoreAuthSession(
        JSON.stringify(expiredState)
      );

      expect(authSession).toBeUndefined();
      // Should not create stamper or inject bundle for expired sessions
      expect(mockCreateTekStamper).not.toHaveBeenCalled();
      expect(mockTekStamper.injectCredentialBundle).not.toHaveBeenCalled();
    });

    it("should handle bundle injection failure", async () => {
      // Mock bundle injection to fail
      vi.mocked(mockTekStamper.injectCredentialBundle).mockResolvedValue(false);

      const validState: AuthSessionState = {
        type: "oauth",
        bundle: "test-bundle",
        expirationDateMs: Date.now() + 60 * 60 * 1000,
        user: mockUser,
      };

      await expect(
        authClient.restoreAuthSession(JSON.stringify(validState))
      ).rejects.toThrow("Failed to inject credential bundle");
    });

    it("should preserve expiration date when restoring session", async () => {
      const originalExpiration = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;

      const validState: AuthSessionState = {
        type: "oauth",
        bundle: "test-bundle",
        expirationDateMs: originalExpiration,
        user: mockUser,
      };

      const restoredSession = await authClient.restoreAuthSession(
        JSON.stringify(validState)
      );

      expect(restoredSession).toBeInstanceOf(AuthSession);
      expect(restoredSession?.getExpirationDateMs()).toBe(originalExpiration);
    });
  });
});

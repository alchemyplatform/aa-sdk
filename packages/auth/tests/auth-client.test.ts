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

// Mock the dev_request module
vi.mock("../src/devRequest.js", () => ({
  dev_request: vi.fn(),
}));

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

describe("AuthClient", () => {
  let authClient: AuthClient;
  let mockCreateTekStamper: CreateTekStamperFn;
  let mockCreateWebAuthnStamper: CreateWebAuthnStamperFn;
  let mockHandleOauthFlow: HandleOauthFlowFn;
  let mockTekStamper: TurnkeyTekStamper;
  let mockWebAuthnStamper: TurnkeyStamper;
  let mockUser: User;
  let mockApiKey: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockApiKey = "test-api-key";

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

    authClient = new AuthClient({
      apiKey: mockApiKey,
      createTekStamper: mockCreateTekStamper,
      createWebAuthnStamper: mockCreateWebAuthnStamper,
      handleOauthFlow: mockHandleOauthFlow,
    });

    // Mock the dev_request to return user data for whoami calls
    const { dev_request } = await import("../src/devRequest.js");
    vi.mocked(dev_request).mockResolvedValue(mockUser);
  });

  describe("loadAuthSessionState", () => {
    it("should load valid OAuth session state", async () => {
      const validOAuthState: AuthSessionState = {
        type: "oauth",
        bundle: "test-oauth-bundle",
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        user: mockUser,
      };

      const authSession = await authClient.loadAuthSessionState(
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

      const authSession = await authClient.loadAuthSessionState(
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

      const authSession = await authClient.loadAuthSessionState(
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
      // Mock the loginWithPasskey method to avoid the "not implemented" error
      const mockLoginWithPasskey = vi.spyOn(authClient, "loginWithPasskey");
      const mockAuthSession = await AuthSession.create({
        apiKey: mockApiKey,
        stamper: mockWebAuthnStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "passkey",
        credentialId: "test-passkey-credential",
      });
      mockLoginWithPasskey.mockResolvedValue(mockAuthSession);

      const validPasskeyState: AuthSessionState = {
        type: "passkey",
        user: mockUser,
        expirationDateMs: Date.now() + 60 * 60 * 1000, // 1 hour from now
        credentialId: "test-passkey-credential",
      };

      const authSession = await authClient.loadAuthSessionState(
        JSON.stringify(validPasskeyState)
      );

      expect(authSession).toBeInstanceOf(AuthSession);
      expect(mockLoginWithPasskey).toHaveBeenCalledWith(
        "test-passkey-credential"
      );

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
        authClient.loadAuthSessionState(JSON.stringify(invalidPasskeyState))
      ).rejects.toThrow("Credential ID is required for passkey authentication");
    });

    it("should return undefined for expired session state", async () => {
      const expiredState: AuthSessionState = {
        type: "oauth",
        bundle: "test-bundle",
        expirationDateMs: Date.now() - 60 * 60 * 1000, // 1 hour ago
        user: mockUser,
      };

      const authSession = await authClient.loadAuthSessionState(
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
        authClient.loadAuthSessionState(JSON.stringify(validState))
      ).rejects.toThrow("Failed to inject credential bundle");
    });
  });
});

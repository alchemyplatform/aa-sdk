import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthSession } from "../src/authSession.js";
import type { User } from "../src/types.js";
import { DEFAULT_SESSION_EXPIRATION_MS } from "../src/utils.js";
import type { AlchemyRestClient } from "@alchemy/common";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import { TurnkeyClient } from "@turnkey/http";
import * as utils from "../src/utils.js";

// Mock getWebAuthnAttestationInternal
vi.spyOn(utils, "getWebAuthnAttestationInternal");

describe("AuthSession", () => {
  let mockTurnkeyClient: TurnkeyClient;
  let mockUser: User;
  let mockSignerHttpClient: AlchemyRestClient<SignerHttpSchema>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockTurnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      {
        stamp: vi.fn().mockResolvedValue({
          stampHeaderName: "X-Stamp",
          stampHeaderValue: "mock-stamp",
        }),
      },
    );

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
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-oauth-bundle",
        authType: "oauth",
        expirationDateMs,
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
        expirationDateMs,
      });
    });

    it("should serialize OTP session state correctly", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-otp-bundle",
        authType: "otp",
        expirationDateMs,
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
        expirationDateMs,
      });
    });

    it("should serialize passkey session state correctly", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "passkey",
        credentialId: "test-passkey-credential-id",
        expirationDateMs,
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
        expirationDateMs,
        credentialId: "test-passkey-credential-id",
      });

      // Passkey state should not have a bundle
      expect(parsedState).not.toHaveProperty("bundle");
    });

    it("should throw error when trying to serialize non-passkey auth without bundle", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        authType: "oauth",
        // No bundle provided
        expirationDateMs,
      });

      expect(() => authSession.getSerializedState()).toThrow(
        "Bundle is required for non-passkey authentication types",
      );
    });

    it("should disconnect when the session expires", async () => {
      vi.useFakeTimers();
      try {
        const expirationDateMs = Date.now() + 10;
        const authSession = await AuthSession.create({
          signerHttpClient: mockSignerHttpClient,
          turnkey: mockTurnkeyClient,
          orgId: mockUser.orgId,
          idToken: mockUser.idToken,
          bundle: "test-oauth-bundle",
          authType: "oauth",
          expirationDateMs,
        });
        let disconnectEventEmitted = false;
        authSession.on("disconnect", () => (disconnectEventEmitted = true));
        expect(authSession.isConnected()).toBe(true);
        vi.advanceTimersByTime(9);
        expect(authSession.isConnected()).toBe(true);
        expect(disconnectEventEmitted).toBe(false);
        vi.advanceTimersByTime(2);
        expect(authSession.isConnected()).toBe(false);
        expect(disconnectEventEmitted).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should emit disconnect event when explicitly disconnected", async () => {
      const expirationDateMs = Date.now() + 10;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClient,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-oauth-bundle",
        authType: "oauth",
        expirationDateMs,
      });
      let disconnectEventEmitted = false;
      authSession.on("disconnect", () => (disconnectEventEmitted = true));
      expect(authSession.isConnected()).toBe(true);
      authSession.disconnect();
      expect(authSession.isConnected()).toBe(false);
      expect(disconnectEventEmitted).toBe(true);
    });
  });

  describe("addPasskey", () => {
    it("should add a passkey to the user's account", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;

      // Mock the attestation result
      const mockAttestation = {
        challenge: new ArrayBuffer(32),
        authenticatorUserId: new ArrayBuffer(16),
        attestation: {
          credentialId: "new-credential-id",
          clientDataJson: "client-data",
          attestationObject: "attestation-object",
          transports: ["AUTHENTICATOR_TRANSPORT_INTERNAL" as const],
        },
      };

      vi.mocked(utils.getWebAuthnAttestationInternal).mockResolvedValue(
        mockAttestation as any,
      );

      // Mock the turnkey client methods
      const mockCreateAuthenticators = vi.fn().mockResolvedValue({
        activity: {
          id: "test-activity-id",
          status: "ACTIVITY_STATUS_COMPLETED",
          result: {
            createAuthenticatorsResult: {
              authenticatorIds: ["test-authenticator-id"],
            },
          },
        },
      });

      const mockTurnkeyClientWithMethods = {
        ...mockTurnkeyClient,
        createAuthenticators: mockCreateAuthenticators,
      };

      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClientWithMethods as any,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-bundle",
        authType: "oauth",
        expirationDateMs,
      });

      const passkeyInfo = await authSession.addPasskey();

      expect(passkeyInfo).toEqual({
        authenticatorId: "test-authenticator-id",
        name: expect.stringMatching(/^passkey-\d+$/),
        createdAt: expect.any(Number),
      });

      expect(mockCreateAuthenticators).toHaveBeenCalledWith({
        type: "ACTIVITY_TYPE_CREATE_AUTHENTICATORS_V2",
        timestampMs: expect.any(String),
        organizationId: mockUser.orgId,
        parameters: {
          userId: mockUser.userId,
          authenticators: [
            {
              attestation: mockAttestation.attestation,
              authenticatorName: expect.stringMatching(/^passkey-\d+$/),
              challenge: expect.any(String),
            },
          ],
        },
      });
    });
  });

  describe("removePasskey", () => {
    it("should remove a passkey from the user's account", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;

      // Mock the turnkey client methods
      const mockDeleteAuthenticators = vi.fn().mockResolvedValue({});

      const mockTurnkeyClientWithMethods = {
        ...mockTurnkeyClient,
        deleteAuthenticators: mockDeleteAuthenticators,
      };

      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClientWithMethods as any,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-bundle",
        authType: "oauth",
        expirationDateMs,
      });

      await authSession.removePasskey("test-authenticator-id");

      expect(mockDeleteAuthenticators).toHaveBeenCalledWith({
        type: "ACTIVITY_TYPE_DELETE_AUTHENTICATORS",
        timestampMs: expect.any(String),
        organizationId: mockUser.orgId,
        parameters: {
          userId: mockUser.userId,
          authenticatorIds: ["test-authenticator-id"],
        },
      });
    });
  });

  describe("addOauthProvider", () => {
    it("should add an OAuth provider to the user's account", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;

      // Mock the turnkey client methods
      const mockStampCreateOauthProviders = vi.fn().mockResolvedValue({
        stampedRequest: "stamped-create-oauth-request",
      });

      const mockTurnkeyClientWithMethods = {
        ...mockTurnkeyClient,
        stampCreateOauthProviders: mockStampCreateOauthProviders,
      };

      // Mock the signer HTTP client response
      const mockOauthProviderInfo = {
        providerId: "test-provider-id",
        issuer: "https://accounts.google.com",
        providerName: "google",
        userDisplayName: "test@example.com",
      };

      vi.mocked(mockSignerHttpClient.request).mockImplementation(
        async (params) => {
          if (params.route === "signer/v1/whoami") {
            return mockUser;
          }
          if (params.route === "signer/v1/add-oauth-provider") {
            return { oauthProviders: [mockOauthProviderInfo] };
          }
          throw new Error(`Unexpected route: ${params.route}`);
        },
      );

      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClientWithMethods as any,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-bundle",
        authType: "oauth",
        expirationDateMs,
      });

      const providerInfo = await authSession.addOauthProvider({
        providerName: "google",
        oidcToken: "test-oidc-token",
      });

      expect(providerInfo).toEqual(mockOauthProviderInfo);

      expect(mockStampCreateOauthProviders).toHaveBeenCalledWith({
        type: "ACTIVITY_TYPE_CREATE_OAUTH_PROVIDERS",
        timestampMs: expect.any(String),
        organizationId: mockUser.orgId,
        parameters: {
          userId: mockUser.userId,
          oauthProviders: [
            {
              providerName: "google",
              oidcToken: "test-oidc-token",
            },
          ],
        },
      });

      expect(mockSignerHttpClient.request).toHaveBeenCalledWith({
        route: "signer/v1/add-oauth-provider",
        method: "POST",
        body: {
          stampedRequest: "stamped-create-oauth-request",
        },
      });
    });
  });

  describe("removeOauthProvider", () => {
    it("should remove an OAuth provider from the user's account", async () => {
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;

      // Mock the turnkey client methods
      const mockStampDeleteOauthProviders = vi.fn().mockResolvedValue({
        stampedRequest: "stamped-delete-oauth-request",
      });

      const mockTurnkeyClientWithMethods = {
        ...mockTurnkeyClient,
        stampDeleteOauthProviders: mockStampDeleteOauthProviders,
      };

      vi.mocked(mockSignerHttpClient.request).mockImplementation(
        async (params) => {
          if (params.route === "signer/v1/whoami") {
            return mockUser;
          }
          if (params.route === "signer/v1/remove-oauth-provider") {
            return {};
          }
          throw new Error(`Unexpected route: ${params.route}`);
        },
      );

      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        turnkey: mockTurnkeyClientWithMethods as any,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-bundle",
        authType: "oauth",
        expirationDateMs,
      });

      await authSession.removeOauthProvider("test-provider-id");

      expect(mockStampDeleteOauthProviders).toHaveBeenCalledWith({
        type: "ACTIVITY_TYPE_DELETE_OAUTH_PROVIDERS",
        timestampMs: expect.any(String),
        organizationId: mockUser.orgId,
        parameters: {
          userId: mockUser.userId,
          providerIds: ["test-provider-id"],
        },
      });

      expect(mockSignerHttpClient.request).toHaveBeenCalledWith({
        route: "signer/v1/remove-oauth-provider",
        method: "POST",
        body: {
          stampedRequest: "stamped-delete-oauth-request",
        },
      });
    });
  });
});

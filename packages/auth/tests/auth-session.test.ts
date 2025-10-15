import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthSession } from "../src/authSession.js";
import type { User, TurnkeyStamper } from "../src/types.js";
import type { AlchemyRestClient } from "@alchemy/common";
import type { SignerHttpSchema } from "@alchemy/aa-infra";
import { DEFAULT_SESSION_EXPIRATION_MS } from "../src/authClient.js";

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
      const expirationDateMs = Date.now() + DEFAULT_SESSION_EXPIRATION_MS;
      const authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
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
        stamper: mockTurnkeyStamper,
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
        stamper: mockTurnkeyStamper,
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
        stamper: mockTurnkeyStamper,
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
          stamper: mockTurnkeyStamper,
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
        stamper: mockTurnkeyStamper,
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

  describe("phone management", () => {
    let authSession: AuthSession;
    let mockTurnkey: any;

    beforeEach(async () => {
      mockTurnkey = {
        stamper: mockTurnkeyStamper,
        stampUpdateUserPhoneNumber: vi
          .fn()
          .mockResolvedValue("stamped-update-phone-request"),
      };

      authSession = await AuthSession.create({
        signerHttpClient: mockSignerHttpClient,
        stamper: mockTurnkeyStamper,
        orgId: mockUser.orgId,
        idToken: mockUser.idToken,
        bundle: "test-bundle",
        authType: "email",
        expirationDateMs: Date.now() + DEFAULT_SESSION_EXPIRATION_MS,
      });

      // Replace the turnkey instance with our mock
      (authSession as any).turnkey = mockTurnkey;
    });

    describe("sendPhoneVerificationCode", () => {
      it("should send verification code to phone number", async () => {
        const phoneNumber = "+15551234567";

        vi.mocked(mockSignerHttpClient.request).mockResolvedValue({
          otpId: "test-otp-id",
        });

        const result = await authSession.sendPhoneVerificationCode(phoneNumber);

        expect(result).toEqual({ otpId: "test-otp-id" });
        expect(mockSignerHttpClient.request).toHaveBeenCalledWith({
          route: "signer/v1/init-otp",
          method: "POST",
          body: { contact: phoneNumber, otpType: "OTP_TYPE_SMS" },
        });
      });

      it("should throw if session is disconnected", async () => {
        authSession.disconnect();

        await expect(
          authSession.sendPhoneVerificationCode("+15551234567"),
        ).rejects.toThrow("Auth session has been disconnected");
      });
    });

    describe("setPhoneNumber", () => {
      it("should set phone number with valid verification", async () => {
        const phoneNumber = "+15551234567";
        const otpId = "test-otp-id";
        const verificationCode = "123456";
        const verificationToken = `header.${btoa(JSON.stringify({ contact: phoneNumber }))}.signature`;

        vi.mocked(mockSignerHttpClient.request).mockImplementation(
          async (params) => {
            if (params.route === "signer/v1/verify-otp") {
              return { verificationToken };
            }
            if (params.route === "signer/v1/update-phone-auth") {
              return undefined;
            }
            throw new Error(`Unexpected route: ${params.route}`);
          },
        );

        await authSession.setPhoneNumber({ otpId, verificationCode });

        expect(mockSignerHttpClient.request).toHaveBeenCalledWith({
          route: "signer/v1/verify-otp",
          method: "POST",
          body: { otpId, otpCode: verificationCode },
        });

        expect(mockTurnkey.stampUpdateUserPhoneNumber).toHaveBeenCalledWith({
          type: "ACTIVITY_TYPE_UPDATE_USER_PHONE_NUMBER",
          timestampMs: expect.any(String),
          organizationId: mockUser.orgId,
          parameters: {
            userId: mockUser.userId,
            userPhoneNumber: phoneNumber,
            verificationToken,
          },
        });

        expect(mockSignerHttpClient.request).toHaveBeenCalledWith(
          expect.objectContaining({
            route: "signer/v1/update-phone-auth",
            method: "POST",
            body: {
              stampedRequest: "stamped-update-phone-request",
            },
          }),
        );

        // Should update local user object
        expect(authSession.getUser().phone).toBe(phoneNumber);
      });

      it("should throw if session is disconnected", async () => {
        authSession.disconnect();

        await expect(
          authSession.setPhoneNumber({
            otpId: "test-otp-id",
            verificationCode: "123456",
          }),
        ).rejects.toThrow("Auth session has been disconnected");
      });
    });

    describe("removePhoneNumber", () => {
      it("should remove phone number from user", async () => {
        // Set initial phone number
        (authSession as any).user = { ...mockUser, phone: "+15551234567" };

        vi.mocked(mockSignerHttpClient.request).mockImplementation(
          async (params) => {
            if (params.route === "signer/v1/update-phone-auth") {
              return undefined;
            }
            throw new Error(`Unexpected route: ${params.route}`);
          },
        );

        await authSession.removePhoneNumber();

        expect(mockTurnkey.stampUpdateUserPhoneNumber).toHaveBeenCalledWith({
          type: "ACTIVITY_TYPE_UPDATE_USER_PHONE_NUMBER",
          timestampMs: expect.any(String),
          organizationId: mockUser.orgId,
          parameters: { userId: mockUser.userId, userPhoneNumber: "" },
        });

        expect(mockSignerHttpClient.request).toHaveBeenCalledWith(
          expect.objectContaining({
            route: "signer/v1/update-phone-auth",
            method: "POST",
            body: {
              stampedRequest: "stamped-update-phone-request",
            },
          }),
        );

        // Should update local user object
        expect(authSession.getUser().phone).toBeUndefined();
      });

      it("should throw if session is disconnected", async () => {
        authSession.disconnect();

        await expect(authSession.removePhoneNumber()).rejects.toThrow(
          "Auth session has been disconnected",
        );
      });
    });
  });
});

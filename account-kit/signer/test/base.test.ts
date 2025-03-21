// test/base.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotAuthenticatedError, MfaRequiredError } from "../src/errors.js";
import { BaseAlchemySigner } from "../src/base.js";
import type { BaseAlchemySignerParams } from "../src/base.js";
import { AlchemySignerStatus } from "../src/types.js";
import type { MfaFactor } from "../src/client/types.js";

import { MockAlchemySignerWebClient } from "./mocks/MockAlchemySignerWebClient.js";
import {
  FAKE_USER,
  FAKE_TOTP_FACTOR,
  OTP_USER,
  MFA_USER,
  TOTP_FACTOR_WITH_CODE,
  EMAIL_AUTH_RESPONSE,
  EMAIL_OTP_RESPONSE,
  EMAIL_OTP_WITH_MFA_RESPONSE,
  OTP_BUNDLE_RESPONSE,
  OTP_MFA_BUNDLE_RESPONSE,
  MOCK_BUNDLE_STRING,
} from "./fixtures.js";

class TestAlchemySigner extends BaseAlchemySigner<MockAlchemySignerWebClient> {
  constructor(params: BaseAlchemySignerParams<MockAlchemySignerWebClient>) {
    super(params);
  }
}

describe("BaseAlchemySigner Integration Tests (MFA scenarios)", () => {
  let mockClient: MockAlchemySignerWebClient;
  let signer: TestAlchemySigner;

  beforeEach(async () => {
    // Mock the document.getElementById method
    vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
      if (id === "test-container") {
        return document.createElement("div");
      }
      return null;
    });

    // Create our mock client & signer
    mockClient = new MockAlchemySignerWebClient({
      connection: { rpcUrl: "http://localhost/mock-rpc" },
      iframeConfig: { iframeContainerId: "test-container" },
    });

    signer = new TestAlchemySigner({
      client: mockClient,
      sessionConfig: {
        expirationTimeMs: 10_000, // 10s for test
      },
    });

    // IMPORTANT: Wait for session manager to finish initialization.
    await new Promise<void>((resolve) => {
      const off = signer["sessionManager"].on("initialized", () => {
        off();
        resolve();
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scenario #1: Email + Magic Link => require TOTP on next call", async () => {
    const multiFactors: MfaFactor[] = [FAKE_TOTP_FACTOR];
    // Mock the initEmailAuth call to throw MfaRequiredError first time
    const mfaError = new MfaRequiredError(multiFactors);
    mockClient.mock_initEmailAuth.mockRejectedValueOnce(mfaError);

    // Attempt to authenticate with magicLink
    await expect(
      signer.authenticate({
        type: "email",
        email: "test@example.com",
        emailMode: "magicLink",
      })
    ).rejects.toThrowError("MFA is required for this user");

    // The status should now be DISCONNECTED (the test user flow ended in an error)
    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.DISCONNECTED
    );

    // Step 2: now pass in TOTP codes
    // We mock the second time initEmailAuth is called to succeed
    mockClient.mock_initEmailAuth.mockResolvedValue(EMAIL_AUTH_RESPONSE);

    // Suppose the final call to completeAuthWithBundle is successful
    mockClient.mock_completeAuthWithBundle.mockResolvedValue(FAKE_USER);

    // Now we do a second authenticate call with the TOTP codes included
    const authPromise = signer.authenticate({
      type: "email",
      email: "test@example.com",
      multiFactors: [TOTP_FACTOR_WITH_CODE],
    });

    // Manually simulate that the client finishes and emits an event.
    setTimeout(() => {
      mockClient.emitClientEvent(
        "connectedEmail",
        FAKE_USER,
        MOCK_BUNDLE_STRING
      );
    }, 25);

    const finalUser = await authPromise;
    expect(finalUser).toEqual(FAKE_USER);
    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.CONNECTED
    );
  });

  it("scenario #2: Email + OTP => second call with {type: 'otp'}", async () => {
    // Step 1: The user calls authenticate() with type=email & emailMode=otp
    mockClient.mock_initEmailAuth.mockResolvedValue(EMAIL_OTP_RESPONSE);

    // This returns a promise that won't resolve until the user eventually becomes connected,
    // or the test forcibly resolves, etc.
    const firstAuth = signer.authenticate({
      type: "email",
      email: "user@otpflow.com",
      emailMode: "otp",
    });

    // WAIT a short moment for the internal .initEmailAuth(...) to finish and set store = AWAITING_EMAIL_AUTH
    await new Promise((r) => setTimeout(r, 0));

    // Now the store should have updated
    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.AWAITING_EMAIL_AUTH
    );
    expect(signer["store"].getState().otpId).toBe("otp-123");

    // Step 2: The user calls authenticate again with type="otp"
    mockClient.mock_submitOtpCode.mockResolvedValue(OTP_BUNDLE_RESPONSE);
    mockClient.mock_completeAuthWithBundle.mockResolvedValue(OTP_USER);

    // Start the OTP authenticate
    const otpPromise = signer.authenticate({ type: "otp", otpCode: "999999" });

    // Simulate the real client's "connectedOtp" event after sign-in completes
    await new Promise((resolve) => setTimeout(resolve, 10));
    mockClient.emitClientEvent(
      "connectedOtp",
      OTP_USER,
      OTP_BUNDLE_RESPONSE.bundle
    );

    const finalUser = await otpPromise;

    expect(finalUser).toEqual(OTP_USER);

    // <-- wait a tick so the store can catch up
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.CONNECTED
    );

    // Clean up the first authenticate call if it's still pending
    await firstAuth.catch(() => null);
  });

  it("scenario #3: Email + OTP + TOTP => require user to pass totp code along with OTP code", async () => {
    // Step 1: user calls authenticate to do email+otp => returns multiFactors
    mockClient.mock_initEmailAuth.mockResolvedValue(
      EMAIL_OTP_WITH_MFA_RESPONSE
    );

    const firstAuth = signer.authenticate({
      type: "email",
      email: "multi@mfa.com",
      emailMode: "otp",
    });
    // **NEW** Wait a microtask so session/store is updated with orgId & AWAITING_EMAIL_AUTH
    await new Promise((r) => setTimeout(r, 0));

    expect(signer.getMfaStatus().mfaRequired).toBe(true);
    expect(signer.getMfaStatus().mfaFactorId).toBe("factor-totp-123");

    // Step 2: user calls authenticate again with OTP code and TOTP factor
    mockClient.mock_submitOtpCode.mockResolvedValue(OTP_MFA_BUNDLE_RESPONSE);

    mockClient.mock_completeAuthWithBundle.mockResolvedValue(MFA_USER);

    // Start the authenticate call
    const authPromise = signer.authenticate({
      type: "otp",
      otpCode: "555555",
      multiFactors: [
        {
          multiFactorId: "factor-totp-123",
          multiFactorCode: "999111",
        },
      ],
    });

    // Now we must emit "connectedOtp" so the signer transitions to CONNECTED
    await new Promise((resolve) => setTimeout(resolve, 25));
    mockClient.emitClientEvent(
      "connectedOtp",
      MFA_USER,
      OTP_MFA_BUNDLE_RESPONSE.bundle
    );

    // If we don't emit the event, `authPromise` never resolves
    const resultUser = await authPromise;

    expect(firstAuth).resolves.toEqual(MFA_USER);
    expect(resultUser).toEqual(MFA_USER);
    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.CONNECTED
    );
  });

  it("throws if we call signMessage without being authenticated", async () => {
    // By default, the signer is not connected until authenticate is called.
    await expect(signer.signMessage("Hello")).rejects.toThrow(
      NotAuthenticatedError
    );
  });
});

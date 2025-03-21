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
  TEST_EMAILS,
  TEST_CODES,
  TEST_DELAYS,
} from "./fixtures.js";

class TestAlchemySigner extends BaseAlchemySigner<MockAlchemySignerWebClient> {
  constructor(params: BaseAlchemySignerParams<MockAlchemySignerWebClient>) {
    super(params);
  }
}

describe("BaseAlchemySigner Integration Tests (MFA scenarios)", () => {
  let mockClient: MockAlchemySignerWebClient;
  let signer: TestAlchemySigner;

  // Helper function to wait for session manager initialization
  const waitForSessionInitialization = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      const off = signer["sessionManager"].on("initialized", () => {
        off();
        resolve();
      });
    });
  };

  // Helper function to wait for microtasks to complete
  const waitForMicrotasks = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, TEST_DELAYS.MICROTASK));
  };

  // Helper to emit client event after a delay
  const emitClientEventAfterDelay = async (
    event: string,
    user: any,
    bundle?: string,
    delay = TEST_DELAYS.CLIENT_EVENT_STANDARD
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (bundle) {
      mockClient.emitClientEvent(event as any, user, bundle);
    } else {
      mockClient.emitClientEvent(event as any, user);
    }
  };

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

    // Wait for session manager to finish initialization
    await waitForSessionInitialization();
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
        email: TEST_EMAILS.BASIC,
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
      email: TEST_EMAILS.BASIC,
      multiFactors: [TOTP_FACTOR_WITH_CODE],
    });

    // Emit client event after delay
    await emitClientEventAfterDelay(
      "connectedEmail",
      FAKE_USER,
      MOCK_BUNDLE_STRING
    );

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
      email: TEST_EMAILS.OTP,
      emailMode: "otp",
    });

    // Wait for internal .initEmailAuth(...) to finish and update store
    await waitForMicrotasks();

    // Now the store should have updated
    expect(signer["store"].getState().status).toBe(
      AlchemySignerStatus.AWAITING_EMAIL_AUTH
    );
    expect(signer["store"].getState().otpId).toBe("otp-123");

    // Step 2: The user calls authenticate again with type="otp"
    mockClient.mock_submitOtpCode.mockResolvedValue(OTP_BUNDLE_RESPONSE);
    mockClient.mock_completeAuthWithBundle.mockResolvedValue(OTP_USER);

    // Start the OTP authenticate
    const otpPromise = signer.authenticate({
      type: "otp",
      otpCode: TEST_CODES.OTP,
    });

    // Simulate the real client's "connectedOtp" event after sign-in completes
    await emitClientEventAfterDelay(
      "connectedOtp",
      OTP_USER,
      OTP_BUNDLE_RESPONSE.bundle,
      TEST_DELAYS.CLIENT_EVENT_SHORT
    );

    const finalUser = await otpPromise;
    expect(finalUser).toEqual(OTP_USER);

    // Wait for store to update
    await waitForMicrotasks();

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
      email: TEST_EMAILS.MFA,
      emailMode: "otp",
    });

    // Wait for session/store to update with orgId & AWAITING_EMAIL_AUTH
    await waitForMicrotasks();

    expect(signer.getMfaStatus().mfaRequired).toBe(true);
    expect(signer.getMfaStatus().mfaFactorId).toBe("factor-totp-123");

    // Step 2: user calls authenticate again with OTP code and TOTP factor
    mockClient.mock_submitOtpCode.mockResolvedValue(OTP_MFA_BUNDLE_RESPONSE);
    mockClient.mock_completeAuthWithBundle.mockResolvedValue(MFA_USER);

    // Start the authenticate call
    const authPromise = signer.authenticate({
      type: "otp",
      otpCode: TEST_CODES.OTP,
      multiFactors: [
        {
          multiFactorId: "factor-totp-123",
          multiFactorCode: TEST_CODES.MFA_TOTP,
        },
      ],
    });

    // Emit "connectedOtp" so the signer transitions to CONNECTED
    await emitClientEventAfterDelay(
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

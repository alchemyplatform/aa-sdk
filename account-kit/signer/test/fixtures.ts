// test/fixtures.ts
import type { User, MfaFactor } from "../src/client/types.js";

// User objects
export const FAKE_USER: User = {
  userId: "user-id-123",
  orgId: "mock-org-id",
  address: "0xabc123",
};

export const OTP_USER: User = {
  userId: "user-42",
  orgId: "mock-org-id",
  address: "0xdef456",
};

export const MFA_USER: User = {
  userId: "user-mfa-321",
  orgId: "mock-org-id",
  address: "0x987654",
};

// Test constants for commonly used values
export const TEST_EMAILS = {
  BASIC: "test@example.com",
  OTP: "user@otpflow.com",
  MFA: "multi@mfa.com",
};

export const TEST_CODES = {
  OTP: "999999",
  TOTP: "111222",
  MFA_TOTP: "999111",
};

export const TEST_DELAYS = {
  MICROTASK: 0,
  CLIENT_EVENT_SHORT: 10,
  CLIENT_EVENT_STANDARD: 25,
  TIMEOUT: 100,
};

// MFA Factors
export const FAKE_TOTP_FACTOR: MfaFactor = {
  multiFactorId: "factor-id-123",
  multiFactorType: "totp",
};

export const TOTP_FACTOR_WITH_CODE = {
  multiFactorId: "factor-id-123",
  multiFactorCode: "111222",
};

// Auth Response Objects
export const EMAIL_AUTH_RESPONSE = {
  orgId: "mock-org-id",
  multiFactors: undefined,
};

export const EMAIL_OTP_RESPONSE = {
  orgId: "mock-org-id",
  otpId: "otp-123",
  multiFactors: [],
};

export const EMAIL_OTP_WITH_MFA_RESPONSE = {
  orgId: "mock-org-id",
  otpId: "otp-xyz",
  multiFactors: [{ multiFactorId: "factor-totp-123", multiFactorType: "totp" }],
};

// Bundle Responses
export const OTP_BUNDLE_RESPONSE = {
  bundle: "mocked-bundle",
};

export const OTP_MFA_BUNDLE_RESPONSE = {
  bundle: "bundle-with-otp-and-totp",
};

export const MOCK_BUNDLE_STRING = "bundle-string";

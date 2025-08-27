import type { Config } from "wagmi";

export type SubmitOtpCodeParameters = {
  otpCode: string;
};

export type SubmitOtpCodeReturnType = void;

/**
 * Phase 2 of email OTP auth — submit the OTP code received by the user.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config.
 * @param {SubmitOtpCodeParameters} parameters - Parameters for OTP submission.
 * @param {string} parameters.otpCode - The OTP code provided by the user.
 */
export async function submitOtpCode(
  config: Config,
  parameters: SubmitOtpCodeParameters,
): Promise<SubmitOtpCodeReturnType> {
  // Keep the dependency surface correct: resolve the smart-wallet connector.
  // (This also validates that the connector is present and throws if not.)
  // const _cx = resolveSmartWallet(config)

  // Stub: real implementation will call the auth client:
  // const auth = await _cx.getAuthClient()
  // await auth.submitOtpCode(parameters.otpCode)

  void config;
  void parameters;

  throw new Error("Not implemented: submitOtpCode");
}

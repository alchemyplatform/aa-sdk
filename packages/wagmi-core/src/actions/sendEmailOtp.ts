import type { Config } from "wagmi";

export type SendEmailOtpParameters = {
  email: string;
};

export type SendEmailOtpReturnType = void;

/**
 * Phase 1 of email OTP auth — request an OTP to be sent to the provided email.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config.
 * @param {SendEmailOtpParameters} parameters - Parameters for the OTP request.
 * @param {string} parameters.email - The user's email address to receive the OTP.
 */
export async function sendEmailOtp(
  config: Config,
  parameters: SendEmailOtpParameters,
): Promise<SendEmailOtpReturnType> {
  // Keep the dependency surface correct: resolve the smart-wallet connector.
  // (This also validates that the connector is present and throws if not.)
  // const _cx = resolveSmartWallet(config)

  // Stub: real implementation will call the auth client:
  // const auth = await _cx.getAuthClient()
  // await auth.sendAuthEmail(parameters.email)

  void config;
  void parameters;

  throw new Error("Not implemented: sendEmailOtp");
}

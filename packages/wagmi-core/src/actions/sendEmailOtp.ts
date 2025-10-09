import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type SendEmailOtpParameters = {
  /** The user's email address to receive the OTP */
  email: string;
  /** The length of the session in milliseconds. Defaults to 15 minutes. */
  sessionExpirationMs?: number;
};

export type SendEmailOtpReturnType = void;

/**
 * Phase 1 of 2 of email OTP auth — request an OTP to be sent to the provided email.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {SendEmailOtpParameters} parameters - Parameters for the OTP request
 * @param {string} parameters.email - The user's email address to receive the OTP
 * @param {number | undefined} [parameters.sessionExpirationMs] - The length of the session in milliseconds (defaults to 15 minutes)
 * @returns {Promise<SendEmailOtpReturnType>} Promise that resolves when the OTP has been sent
 */
export async function sendEmailOtp(
  config: Config,
  parameters: SendEmailOtpParameters,
): Promise<SendEmailOtpReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);

  const authClient = connector.getAuthClient();
  await authClient.sendEmailOtp({
    email: parameters.email,
    sessionExpirationMs: parameters.sessionExpirationMs,
  });
}

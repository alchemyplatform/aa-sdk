import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type SendSmsOtpParameters = {
  /** The user's phone number with country code (e.g., "+12025551234") */
  phoneNumber: string;
  /** The length of the session in milliseconds. Defaults to 15 minutes. */
  sessionExpirationMs?: number;
};

export type SendSmsOtpReturnType = void;

/**
 * Phase 1 of 2 of SMS OTP auth — request an OTP to be sent to the provided phone number.
 *
 * Phone number must include country code (e.g., "+12025551234").
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {SendSmsOtpParameters} parameters - Parameters for the OTP request
 * @param {string} parameters.phoneNumber - The user's phone number with country code to receive the OTP
 * @param {number | undefined} [parameters.sessionExpirationMs] - The length of the session in milliseconds (defaults to 15 minutes)
 * @returns {Promise<SendSmsOtpReturnType>} Promise that resolves when the OTP has been sent
 */
export async function sendSmsOtp(
  config: Config,
  parameters: SendSmsOtpParameters,
): Promise<SendSmsOtpReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);

  const authClient = connector.getAuthClient();
  await authClient.sendSmsOtp({
    phoneNumber: parameters.phoneNumber,
    sessionExpirationMs: parameters.sessionExpirationMs,
  });
}

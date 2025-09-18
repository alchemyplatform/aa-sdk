import { resolveAlchemyAuthConnector } from "@alchemy/connectors-web";
import type { Config } from "@wagmi/core";

export type SendEmailOtpParameters = {
  email: string;
};

export type SendEmailOtpReturnType = void;

/**
 * Phase 1 of 2 of email OTP auth — request an OTP to be sent to the provided email.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {SendEmailOtpParameters} parameters - Parameters for the OTP request
 * @param {string} parameters.email - The user's email address to receive the OTP
 * @returns {Promise<SendEmailOtpReturnType>} Promise that resolves when the OTP has been sent
 */
export async function sendEmailOtp(
  config: Config,
  parameters: SendEmailOtpParameters,
): Promise<SendEmailOtpReturnType> {
  const connector = resolveAlchemyAuthConnector(config);

  const authClient = connector.getAuthClient();
  // TODO(jh): this fails if the account doesn't exist yet. do we want to handle creating accounts here?
  await authClient.sendEmailOtp({ email: parameters.email });
}

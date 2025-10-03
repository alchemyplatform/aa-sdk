import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type SubmitOtpCodeParameters = {
  otpCode: string;
};

export type SubmitOtpCodeReturnType = void;

/**
 * Phase 2 of 2 of email OTP auth — submit the OTP code received by the user.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {SubmitOtpCodeParameters} parameters - Parameters for OTP submission
 * @param {string} parameters.otpCode - The OTP code provided by the user
 * @returns {Promise<SubmitOtpCodeReturnType>} Promise that resolves when authentication completes and connection is established
 */
export async function submitOtpCode(
  config: Config,
  parameters: SubmitOtpCodeParameters,
): Promise<SubmitOtpCodeReturnType> {
  const { connector, connectAlchemyAuth } = resolveAlchemyAuthConnector(config);
  const authClient = connector.getAuthClient();
  const authSession = await authClient.submitOtpCode({
    otpCode: parameters.otpCode,
  });

  connector.setAuthSession(authSession);
  await connectAlchemyAuth();
}

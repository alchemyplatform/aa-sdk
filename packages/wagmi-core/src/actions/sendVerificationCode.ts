import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { BaseError } from "@alchemy/common";

export type SendVerificationCodeParameters = {
  /** The contact to send verification code to (email or phone number) */
  contact: string;
  /** The type of verification code to send */
  type: "email" | "phone";
};

export type SendVerificationCodeReturnType = void;

/**
 * Sends a verification code to the specified email or phone number.
 *
 * This is used to initiate the verification process for updating email or phone number.
 * After calling this, the user will receive a code via email or SMS which should be
 * submitted using the updateEmail or updatePhoneNumber actions.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {SendVerificationCodeParameters} parameters - Verification code parameters
 * @param {string} parameters.contact - The email address or phone number to send the code to
 * @param {"email" | "phone"} parameters.type - The type of contact (email or phone)
 * @returns {Promise<SendVerificationCodeReturnType>} Promise that resolves when the code is sent
 *
 * @example
 * ```ts
 * // Send code to email
 * await sendVerificationCode(config, {
 *   contact: "user@example.com",
 *   type: "email"
 * });
 *
 * // Send code to phone
 * await sendVerificationCode(config, {
 *   contact: "+15551234567",
 *   type: "phone"
 * });
 * ```
 */
export async function sendVerificationCode(
  config: Config,
  parameters: SendVerificationCodeParameters,
): Promise<SendVerificationCodeReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);
  const authSession = connector.getAuthSession();

  if (!authSession) {
    throw new BaseError("No active auth session. Please authenticate first.");
  }

  if (parameters.type === "email") {
    await authSession.sendEmailVerificationCode(parameters.contact);
  } else {
    await authSession.sendPhoneVerificationCode(parameters.contact);
  }
}

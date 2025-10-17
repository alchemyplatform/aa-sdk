import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { BaseError } from "@alchemy/common";

export type UpdateEmailParameters =
  | {
      /** The OTP verification code received via email */
      verificationCode: string;
    }
  | {
      /** Pass null to remove the email from the account */
      email: null;
    };

export type UpdateEmailReturnType = void;

/**
 * Updates or removes the email address associated with the authenticated user.
 *
 * To update an email:
 * 1. Call sendVerificationCode() with the new email address
 * 2. User receives verification code via email
 * 3. Call updateEmail() with the verification code
 *
 * To remove an email:
 * - Call updateEmail() with `{ email: null }`
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {UpdateEmailParameters} parameters - Update email parameters
 * @returns {Promise<UpdateEmailReturnType>} Promise that resolves when email is updated or removed
 *
 * @example
 * ```ts
 * // Update email
 * await sendVerificationCode(config, {
 *   contact: "newemail@example.com",
 *   type: "email"
 * });
 * // User enters code from email
 * await updateEmail(config, { verificationCode: "123456" });
 *
 * // Remove email
 * await updateEmail(config, { email: null });
 * ```
 */
export async function updateEmail(
  config: Config,
  parameters: UpdateEmailParameters,
): Promise<UpdateEmailReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);
  const authSession = connector.getAuthSession();

  if (!authSession) {
    throw new BaseError("No active auth session. Please authenticate first.");
  }

  // Remove email.
  if ("email" in parameters) {
    if (parameters.email !== null) {
      throw new BaseError(
        "To update email, must provide a verification code instead of an email address.",
      );
    }
    await authSession.removeEmail();
    return;
  }

  // Update email.
  await authSession.setEmail(parameters);
}

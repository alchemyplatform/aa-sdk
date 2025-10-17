import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";
import { BaseError } from "@alchemy/common";

export type UpdatePhoneNumberParameters =
  | {
      /** The OTP verification code received via SMS */
      verificationCode: string;
    }
  | {
      /** Pass null to remove the phone number from the account */
      phoneNumber: null;
    };

export type UpdatePhoneNumberReturnType = void;

/**
 * Updates or removes the phone number associated with the authenticated user.
 *
 * To update a phone number:
 * 1. Call sendVerificationCode() with the new phone number
 * 2. User receives verification code via SMS
 * 3. Call updatePhoneNumber() with the verification code
 *
 * To remove a phone number:
 * - Call updatePhoneNumber() with `{ phoneNumber: null }`
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {UpdatePhoneNumberParameters} parameters - Update phone number parameters
 * @returns {Promise<UpdatePhoneNumberReturnType>} Promise that resolves when phone number is updated or removed
 *
 * @example
 * ```ts
 * // Update phone number
 * await sendVerificationCode(config, {
 *   contact: "+15551234567",
 *   type: "phone"
 * });
 * // User enters code from SMS
 * await updatePhoneNumber(config, { verificationCode: "123456" });
 *
 * // Remove phone number
 * await updatePhoneNumber(config, { phoneNumber: null });
 * ```
 */
export async function updatePhoneNumber(
  config: Config,
  parameters: UpdatePhoneNumberParameters,
): Promise<UpdatePhoneNumberReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);
  const authSession = connector.getAuthSession();

  if (!authSession) {
    throw new BaseError("No active auth session. Please authenticate first.");
  }

  // Remove phone number.
  if ("phoneNumber" in parameters) {
    if (parameters.phoneNumber !== null) {
      throw new BaseError(
        "The 'phoneNumber' parameter only accepts null for removal. " +
          "To update phone number, use { verificationCode: 'code' } after calling sendVerificationCode().",
      );
    }
    await authSession.removePhoneNumber();
    return;
  }

  // Update phone number.
  await authSession.setPhoneNumber(parameters);
}

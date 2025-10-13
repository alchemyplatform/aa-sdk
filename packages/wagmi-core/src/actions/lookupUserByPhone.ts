import { type Config } from "@wagmi/core";
import { resolveAlchemyAuthConnector } from "../utils/resolveAuthConnector.js";

export type LookupUserByPhoneParameters = {
  /** The user's phone number with country code to look up */
  phoneNumber: string;
};

export type LookupUserByPhoneReturnType = { orgId: string } | null;

/**
 * Looks up if a phone number is registered in the system.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {LookupUserByPhoneParameters} parameters - Parameters for the lookup
 * @param {string} parameters.phoneNumber - The user's phone number with country code to look up
 * @returns {Promise<LookupUserByPhoneReturnType>} Promise that resolves to org ID if phone exists, null otherwise
 */
export async function lookupUserByPhone(
  config: Config,
  parameters: LookupUserByPhoneParameters,
): Promise<LookupUserByPhoneReturnType> {
  const { connector } = resolveAlchemyAuthConnector(config);

  const authClient = connector.getAuthClient();
  return await authClient.lookupUserByPhone(parameters.phoneNumber);
}

import type { Address } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { ModularAccountV1Base } from "../base";

/**
 * A mapping of default addresses for the ModularAccountV1.
 */
export const DefaultAddress = {
  MULTI_SIG_MAV1_FACTORY: "0x000000000000204327E6669f00901a57CE15aE15",
  MULTI_OWNER_MAV1_FACTORY: "0x000000e92D78D90000007F0082006FDA09BD5f11",
  // TODO(jh): add other addresses
} satisfies Record<string, Address>;

/**
 * A mapping of default addresses for the ModularAccountV2 plugins.
 */
export const DefaultModuleAddress = {
  MULTI_OWNER: "0xcE0000007B008F50d762D155002600004cD6c647",
  MULTI_SIG: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
  SESSION_KEY: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
} satisfies Record<string, Address>;

// TODO(jh): add any other consts or utils here as needed.

/**
 * Checks if an account is a ModularAccountV1.
 *
 * @param {SmartAccount} account - The account to check.
 * @returns {boolean} True if the account is a ModularAccountV1, false otherwise.
 */
export function isModularAccountV1(
  account: SmartAccount,
): account is ModularAccountV1Base {
  return "source" in account && account.source === "ModularAccountV1";
}

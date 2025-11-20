import type { Address } from "viem";

/**
 * A mapping of default addresses for the ModularAccountV1.
 */
export const DefaultAddress = {
  MULTI_SIG_MAV1_FACTORY: "0x000000000000204327E6669f00901a57CE15aE15",
  MULTI_OWNER_MAV1_FACTORY: "0x000000e92D78D90000007F0082006FDA09BD5f11",
  IMPLEMENTATION_ADDRESS: "0x0046000000000151008789797b54fdb500e2a61e",
} satisfies Record<string, Address>;

/**
 * A mapping of default addresses for the ModularAccountV1 plugins.
 */
export const DefaultPluginAddress = {
  MULTI_OWNER: "0xcE0000007B008F50d762D155002600004cD6c647",
  MULTI_SIG: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7",
  SESSION_KEY: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d",
} satisfies Record<string, Address>;

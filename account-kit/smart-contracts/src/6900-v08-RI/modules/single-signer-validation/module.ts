import type { Address } from "viem";

const addresses = {
  default: "0x9DA8c098A483E257dd96022831DF308cB24fCBE6",
} as Record<number | "default", Address>;

export const meta = {
  name: "SingleSignerValidation",
  version: "alpha.0",
  addresses,
};

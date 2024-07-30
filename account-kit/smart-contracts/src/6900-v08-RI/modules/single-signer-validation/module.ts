import type { Address } from "viem";

const addresses = {
  421614: "0x9DA8c098A483E257dd96022831DF308cB24fCBE6",
} as Record<number, Address>;

export const meta = {
  name: "SingleSignerValidation",
  version: "alpha.0",
  addresses,
};

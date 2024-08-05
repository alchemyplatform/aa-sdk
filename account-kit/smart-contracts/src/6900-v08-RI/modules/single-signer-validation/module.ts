import type { Address } from "viem";

const addresses = {
  default: "0xEa3a0b544d517f6Ed3Dc2186C74D869c702C376e",
} as Record<number | "default", Address>;

export const meta = {
  name: "SingleSignerValidation",
  version: "alpha.0",
  addresses,
};

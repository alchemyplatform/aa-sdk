import type { Address } from "viem";

interface Account {
  address: Address;
}

export type AccountParam = Address | Account | null;

export function resolveAddress(account: Address | Account): Address {
  return typeof account === "string" ? account : account.address;
}

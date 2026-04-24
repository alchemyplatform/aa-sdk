import type { Address } from "viem";

interface Account {
  address: Address;
}

export type AccountParam = Address | Account | null;

export function resolveAddress(account: Address | Account): Address {
  return typeof account === "string" ? account : account.address;
}

export type SolanaAccountParam = string | { address: string };

export function resolveSolanaAddress(
  account: string | { address: string },
): string {
  return typeof account === "string" ? account : account.address;
}

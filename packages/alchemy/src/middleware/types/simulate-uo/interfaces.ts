import type { Address } from "viem";
import type { SimulateAssetType } from "./enums.js";

export interface SimulateAssetChangesError extends Record<string, any> {
  message: string;
}

export interface SimulateAssetChange {
  assetType: SimulateAssetType;
  changeType: string;
  from: Address;
  to: Address;
  rawAmount?: string;
  amount?: string;
  contactAddress: Address;
  tokenId?: string;
  decimals: number;
  symbol: string;
  name?: string;
  logo?: string;
}

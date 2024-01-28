import type { UserOperationStruct } from "@alchemy/aa-core";
import type { Address, Hash } from "viem";

export enum SimulateAssetType {
  NATIVE = "NATIVE",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  /**
   * Special contracts that don't follow ERC 721/1155. Currently limited to
   * CryptoKitties and CryptoPunks.
   */
  SPECIAL_NFT = "SPECIAL_NFT",
}

export enum SimulateChangeType {
  APPROVE = "APPROVE",
  TRANSFER = "TRANSFER",
}

export type SimulateUserOperationAssetChangesRequest = [
  UserOperationStruct,
  entryPoint: Address,
  blockNumber?: Hash
];

export type SimulateUserOperationAssetChangesResponse = {
  changes: SimulateAssetChange[];
  error?: SimulateAssetChangesError;
};

export interface SimulateAssetChangesError extends Record<string, any> {
  message: string;
}

export interface SimulateAssetChange {
  assetType: SimulateAssetType;
  changeType: SimulateChangeType;
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

import type { UserOperationStruct } from "@alchemy/aa-core";
import type { Address, Hash } from "viem";
import type { SimulateAssetType } from "./enums.js";
import type { SimulateAssetChangesError } from "./interfaces.js";

export type SimulateUserOperationAssetChangesRequest = [
  UserOperationStruct,
  entryPoint: Address,
  blockNumber?: Hash
];

export type SimulateUserOperationAssetChangesResponse = {
  changes: [
    {
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
  ];
  gasUsed?: string;
  error?: SimulateAssetChangesError;
};

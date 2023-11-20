import type { UserOperationStruct } from "@alchemy/aa-core";
import type { Address, Hash } from "viem";
import type {
  SimulateAssetChange,
  SimulateAssetChangesError,
} from "./interfaces.js";

export type SimulateUserOperationAssetChangesRequest = [
  UserOperationStruct,
  entryPoint: Address,
  blockNumber?: Hash
];

export type SimulateUserOperationAssetChangesResponse = {
  changes: SimulateAssetChange[];
  error?: SimulateAssetChangesError;
};

import { encodeAbiParameters, type Hex } from "viem";

import { timeRangeModuleAbi } from "./abis/timeRangeModuleAbi.js";

// Todo: some unified type for ERC-6900 v0.8 modules. I couldn't figure out how to parameterize the class itself over the abi type parameters for onInstall and onUninstall.
export const TimeRangeModule = {
  abi: timeRangeModuleAbi,
  encodeOnInstallData: (args: {
    entityId: number;
    validUntil: number;
    validAfter: number;
  }): Hex => {
    const { entityId, validUntil, validAfter } = args;

    return encodeAbiParameters(
      [
        {
          type: "uint32",
        },
        {
          type: "uint48",
        },
        {
          type: "uint48",
        },
      ],
      [entityId, validUntil, validAfter]
    );
  },
  encodeOnUninstallData: (args: { entityId: number }): Hex => {
    const { entityId } = args;

    return encodeAbiParameters(
      [
        {
          type: "uint32",
        },
      ],
      [entityId]
    );
  },
  encodeSetTimeRange: (args: {
    entityId: number;
    validUntil: number;
    validAfter: number;
  }): Hex => {
    const { entityId, validUntil, validAfter } = args;

    return encodeAbiParameters(
      [
        {
          type: "uint32",
        },
        {
          type: "uint48",
        },
        {
          type: "uint48",
        },
      ],
      [entityId, validUntil, validAfter]
    );
  },
};

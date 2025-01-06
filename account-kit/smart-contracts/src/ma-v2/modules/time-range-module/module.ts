import { encodeAbiParameters, type Hex } from "viem";

import { timeRangeModuleAbi } from "./abis/timeRangeModuleAbi.js";

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

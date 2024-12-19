import { encodeAbiParameters, type Address, type Hex } from "viem";

import { timeRangeModuleAbi } from "./abis/timeRangeModuleAbi.js";

const addresses = {
  default: "0x00", // TO DO: replace with deployed module address?
} as Record<number | "default", Address>;

const meta = {
  name: "TimeRangeModule",
  version: "alpha.1",
  addresses,
};

// Todo: some unified type for ERC-6900 v0.8 modules. I couldn't figure out how to parameterize the class itself over the abi type parameters for onInstall and onUninstall.
export const TimeRangeModule = {
  meta,
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
          value: entityId,
        },
        {
          type: "uint48",
          value: validUntil,
        },
        {
          type: "uint48",
          value: validAfter,
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
          value: entityId,
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
          value: entityId,
        },
        {
          type: "uint48",
          value: validUntil,
        },
        {
          type: "uint48",
          value: validAfter,
        },
      ],
      [entityId, validUntil, validAfter]
    );
  },
};

import {
  encodeAbiParameters,
  parseAbiParameters,
  type Address,
  type Hex,
} from "viem";

import { AllowlistModuleAbi } from "./abis/AllowlistModule.js";

const addresses = {
  default: "0x5B13F222A841A42C59324FFF0A229FfeA1CAcC3c",
} as Record<number | "default", Address>;

const meta = {
  name: "AllowlistModule",
  version: "alpha.1",
  addresses,
};

export const AllowlistModule = {
  meta,
  abi: AllowlistModuleAbi,
  encodeOnInstallData: (args: {
    entityId: number;
    allowlistInit: {
      target: Address;
      hasSelectorAllowlist: boolean;
      selectors: Hex[];
    }[];
  }): Hex => {
    const { entityId, allowlistInit } = args;

    return encodeAbiParameters(
      parseAbiParameters(
        "uint32 entityId, (address target, bool hasSelectorAllowlist, bytes4[] selectors)[] allowlistInit"
      ),
      [entityId, allowlistInit]
    );
  },
  encodeOnUninstallData: (args: {
    entityId: number;
    allowlistInit: {
      target: Address;
      hasSelectorAllowlist: boolean;
      selectors: Hex[];
    }[];
  }): Hex => {
    const { entityId, allowlistInit } = args;

    return encodeAbiParameters(
      parseAbiParameters(
        "uint32 entityId, (address target, bool hasSelectorAllowlist, bytes4[] selectors)[] allowlistInit"
      ),
      [entityId, allowlistInit]
    );
  },
};

import { encodeAbiParameters, type Address, type Hex } from "viem";

import { nativeTokenLimitModuleAbi } from "./abis/nativeTokenLimitModuleAbi.js";

const addresses: Record<number | "default", Address> = {
  default: "0xEa6a05306315196f2A7CA2ec7eEA45290bae00A0",
};

const meta = {
  name: "NativeTokenLimitModule",
  version: "alpha.1",
  addresses,
};

export const nativeTokenLimitModule = {
  meta,
  abi: nativeTokenLimitModuleAbi,

  encodeOnInstallData: (args: {
    entityId: number;
    spendLimit: bigint;
  }): Hex => {
    const { entityId, spendLimit } = args;
    return encodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }],
      [entityId, spendLimit]
    );
  },

  encodeOnUninstallData: (args: { entityId: number }): Hex => {
    const { entityId } = args;
    return encodeAbiParameters([{ type: "uint32" }], [entityId]);
  },
};

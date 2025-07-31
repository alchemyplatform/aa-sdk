import { encodeAbiParameters, type Hex } from "viem";
import { nativeTokenLimitModuleAbi } from "./abis/nativeTokenLimitModuleAbi.js";

export const NativeTokenLimitModule = {
  abi: nativeTokenLimitModuleAbi,
  encodeOnInstallData: (args: {
    entityId: number;
    spendLimit: bigint;
  }): Hex => {
    const { entityId, spendLimit } = args;
    return encodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }],
      [entityId, spendLimit],
    );
  },

  encodeOnUninstallData: (args: { entityId: number }): Hex => {
    const { entityId } = args;
    return encodeAbiParameters([{ type: "uint32" }], [entityId]);
  },
};

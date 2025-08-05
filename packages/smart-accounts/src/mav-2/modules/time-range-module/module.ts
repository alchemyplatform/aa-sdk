import { encodeAbiParameters, type Address, type Hex } from "viem";

import { timeRangeModuleAbi } from "./abis/timeRangeModuleAbi.js";
import { HookType, type HookConfig } from "../../types.js";

export const TimeRangeModule = {
  abi: timeRangeModuleAbi,
  buildHook: (
    installArgs: {
      entityId: number;
      validUntil: number;
      validAfter: number;
    },
    address: Address,
  ): { hookConfig: HookConfig; initData: Hex } => {
    if (installArgs.validUntil > 2 ** 48 - 1) {
      throw new Error(
        "TimeRangeModule.buildHook: validUntil > type(uint48).max",
      );
    }

    if (installArgs.validAfter > 2 ** 48 - 1) {
      throw new Error(
        "TimeRangeModule.buildHook: validAfter > type(uint48).max",
      );
    }

    const installData = TimeRangeModule.encodeOnInstallData(installArgs);
    return {
      hookConfig: {
        address: address,
        entityId: installArgs.entityId,
        hookType: HookType.VALIDATION,
        hasPreHooks: false,
        hasPostHooks: false,
      },
      initData: installData,
    };
  },
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
      [entityId, validUntil, validAfter],
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
      [entityId],
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
      [entityId, validUntil, validAfter],
    );
  },
};

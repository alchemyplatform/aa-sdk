import { encodeAbiParameters, type Address, type Hex } from "viem";
import { allowlistModuleAbi } from "./abis/allowlistModuleAbi.js";
import { HookType, type HookConfig } from "../../actions/common/types.js";

export const AllowlistModule = {
  abi: allowlistModuleAbi,
  buildHook: (
    installArgs: {
      entityId: number;
      inputs: Array<{
        target: Address;
        hasSelectorAllowlist: boolean;
        hasERC20SpendLimit: boolean;
        erc20SpendLimit: bigint;
        selectors: Array<Hex>;
      }>;
    },
    address: Address,
  ): {
    hookConfig: HookConfig;
    initData: Hex;
  } => {
    const installData = AllowlistModule.encodeOnInstallData(installArgs);
    return {
      hookConfig: {
        address: address,
        entityId: installArgs.entityId,
        hookType: HookType.VALIDATION,
        hasPreHooks: true,
        hasPostHooks: false,
      },
      initData: installData,
    };
  },
  encodeOnInstallData: (args: {
    entityId: number;
    inputs: Array<{
      target: Address;
      hasSelectorAllowlist: boolean;
      hasERC20SpendLimit: boolean;
      erc20SpendLimit: bigint;
      selectors: Array<Hex>;
    }>;
  }): Hex => {
    const { entityId, inputs } = args;
    return encodeAbiParameters(
      [
        { type: "uint32" },
        {
          type: "tuple[]",
          components: [
            { type: "address" },
            { type: "bool" },
            { type: "bool" },
            { type: "uint256" },
            { type: "bytes4[]" },
          ],
        },
      ],
      [
        entityId,
        inputs.map(
          (input) =>
            [
              input.target,
              input.hasSelectorAllowlist,
              input.hasERC20SpendLimit,
              input.erc20SpendLimit,
              input.selectors,
            ] as const,
        ),
      ],
    );
  },

  encodeOnUninstallData: (args: {
    entityId: number;
    inputs: Array<{
      target: Address;
      hasSelectorAllowlist: boolean;
      hasERC20SpendLimit: boolean;
      erc20SpendLimit: bigint;
      selectors: Array<Hex>;
    }>;
  }): Hex => {
    const { entityId, inputs } = args;
    return encodeAbiParameters(
      [
        { type: "uint32" },
        {
          type: "tuple[]",
          components: [
            { type: "address" },
            { type: "bool" },
            { type: "bool" },
            { type: "uint256" },
            { type: "bytes4[]" },
          ],
        },
      ],
      [
        entityId,
        inputs.map(
          (input) =>
            [
              input.target,
              input.hasSelectorAllowlist,
              input.hasERC20SpendLimit,
              input.erc20SpendLimit,
              input.selectors,
            ] as const,
        ),
      ],
    );
  },
};

import { encodeAbiParameters, type Address, type Hex } from "viem";

import { allowlistModuleAbi } from "./abis/allowlistModuleAbi.js";

const addresses: Record<number | "default", Address> = {
  default: "0xE46ca4a98c485caEE2Abb6ef5116292B8c78a868",
};

const meta = {
  name: "AllowlistModule",
  version: "alpha.1",
  addresses,
};

export const allowlistModule = {
  meta,
  abi: allowlistModuleAbi,
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
            ] as const
        ),
      ]
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
            ] as const
        ),
      ]
    );
  },
};

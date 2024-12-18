import { encodeAbiParameters, type Address, type Hex } from "viem";
import { paymasterGuardModuleAbi } from "./abis/paymasterGuardModuleAbi.js";

const addresses = {
  default: "0x00", //dummy address, replace with deployed module address?
} as Record<number | "default", Address>;

const meta = {
  name: "PaymasterGuardModule",
  version: "alpha.1",
  addresses,
};

export const PaymasterGuardModule = {
  meta,
  abi: paymasterGuardModuleAbi,
  encodeOnInstallData: (args: {
    entityId: number;
    paymaster: Address;
  }): Hex => {
    const { entityId, paymaster } = args;
    return encodeAbiParameters(
      [
        {
          type: "uint32",
          value: entityId,
        },
        {
          type: "address",
          value: paymaster,
        },
      ],
      [entityId, paymaster]
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
};

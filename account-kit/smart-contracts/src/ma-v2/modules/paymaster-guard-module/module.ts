import { encodeAbiParameters, type Address, type Hex } from "viem";
import { paymasterGuardModuleAbi } from "./abis/paymasterGuardModuleAbi.js";

export const PaymasterGuardModule = {
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
        },
        {
          type: "address",
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
        },
      ],
      [entityId]
    );
  },
};

import { encodeAbiParameters, type Address, type Hex } from "viem";

import { singleSignerValidationModuleAbi } from "./abis/singleSignerValidationModuleAbi.js";

// Todo: some unified type for ERC-6900 v0.8 modules. I couldn't figure out how to parameterize the class itself over the abi type parameters for onInstall and onUninstall.
export const SingleSignerValidationModule = {
  abi: singleSignerValidationModuleAbi,
  encodeOnInstallData: (args: { entityId: number; signer: Address }): Hex => {
    const { entityId, signer } = args;
    return encodeAbiParameters(
      [
        {
          type: "uint32",
        },
        {
          type: "address",
        },
      ],
      [entityId, signer]
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

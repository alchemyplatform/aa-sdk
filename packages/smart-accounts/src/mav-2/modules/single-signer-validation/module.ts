import { encodeAbiParameters, type Address, type Hex } from "viem";

export const SingleSignerValidationModule = {
  encodeOnInstallData: (args: { entityId: number; signer: Address }): Hex => {
    const { entityId, signer } = args;
    return encodeAbiParameters(
      [{ type: "uint32" }, { type: "address" }],
      [entityId, signer],
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
};

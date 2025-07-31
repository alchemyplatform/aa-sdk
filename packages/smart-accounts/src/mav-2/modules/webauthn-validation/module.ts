import { encodeAbiParameters, type Hex } from "viem";

export const WebAuthnValidationModule = {
  encodeOnInstallData: (args: {
    entityId: number;
    x: bigint;
    y: bigint;
  }): Hex => {
    const { entityId, x, y } = args;
    return encodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }, { type: "uint256" }],
      [entityId, x, y],
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

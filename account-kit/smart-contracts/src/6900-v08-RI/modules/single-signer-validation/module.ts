import { encodeAbiParameters, type Address, type Hex } from "viem";

const addresses = {
  default: "0xEa3a0b544d517f6Ed3Dc2186C74D869c702C376e",
} as Record<number | "default", Address>;

const meta = {
  name: "SingleSignerValidation",
  version: "alpha.1",
  addresses,
};

export const SingleSignerValidationModule = {
  meta,
  encodeOnInstallData: (args: { entityId: number; signer: Address }): Hex => {
    const { entityId, signer } = args;

    return encodeAbiParameters(
      [
        {
          type: "uint32",
          value: entityId,
        },
        {
          type: "address",
          value: signer,
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
          value: entityId,
        },
      ],
      [entityId]
    );
  },
};

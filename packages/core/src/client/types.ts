import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { z } from "zod";
import type { UserOperationRequest } from "../types.js";
import type { ConnectionConfigSchema } from "./schema.js";

export type ConnectorData = {
  chainId?: Hex;
};

export type ConnectionConfig = z.input<typeof ConnectionConfigSchema>;

export type SendUserOperationResult = {
  hash: Hash;
  request: UserOperationRequest;
};

export type UpgradeToData = {
  implAddress: Address;
  initializationData: Hex;
};

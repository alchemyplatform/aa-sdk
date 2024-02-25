import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { z } from "zod";
import type {
  ClientMiddleware,
  ClientMiddlewareFn,
} from "../middleware/types.js";
import type { UserOperationRequest } from "../types.js";
import type { ConnectionConfigSchema } from "./schema.js";

export type ConnectorData = {
  chainId?: Hex;
};

export type ConnectionConfig = z.input<typeof ConnectionConfigSchema>;

//#region SendUserOperationResult
export type SendUserOperationResult = {
  hash: Hash;
  request: UserOperationRequest;
};
//#endregion SendUserOperationResult

//#region UpgradeToData
export type UpgradeToData = {
  implAddress: Address;
  initializationData: Hex;
};
//#endregion UpgradeToData

export type ClientMiddlewareConfig = Omit<
  Partial<ClientMiddleware>,
  "dummyPaymasterAndData" | "paymasterAndData"
> & {
  paymasterAndData?: {
    dummyPaymasterAndData: () => Hex;
    paymasterAndData: ClientMiddlewareFn;
  };
};

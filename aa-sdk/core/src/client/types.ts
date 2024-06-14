import type { Address } from "abitype";
import type { Hash, Hex } from "viem";
import type { z } from "zod";
import type { UserOperationContext } from "../actions/smartAccount/types.js";
import type { EntryPointVersion } from "../entrypoint/types.js";
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

// [!region SendUserOperationResult]
export type SendUserOperationResult<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  hash: Hash;
  request: UserOperationRequest<TEntryPointVersion>;
};
// [!endregion SendUserOperationResult]

// [!region UpgradeToData]
export type UpgradeToData = {
  implAddress: Address;
  initializationData: Hex;
};
// [!endregion UpgradeToData]

// [!region ClientMiddlewareConfig]
export type ClientMiddlewareConfig<
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = Omit<
  Partial<ClientMiddleware<TContext>>,
  "dummyPaymasterAndData" | "paymasterAndData"
> & {
  paymasterAndData?: {
    dummyPaymasterAndData: () =>
      | UserOperationRequest<"0.6.0">["paymasterAndData"]
      | Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">;
    paymasterAndData: ClientMiddlewareFn<TContext>;
  };
};
// [!endregion ClientMiddlewareConfig]

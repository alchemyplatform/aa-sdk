import { entryPointRegistry } from "../entrypoint/index.js";
import type {
  EntryPointVersion,
  SupportedEntryPoint,
} from "../entrypoint/types.js";
import type { UserOperationRequest, UserOperationStruct } from "../types.js";
import type { Interface } from "./types.js";

export function getEntryPointVersionFromUserOp(
  op: Interface<UserOperationRequest | UserOperationStruct>
) {
  const filtered = Object.values(entryPointRegistry).filter(
    (ep: SupportedEntryPoint) => ep.isUserOpVersion(op)
  );
  if (filtered.length !== 1) {
    throw new Error(
      "The user operation does not match a unique entry point version."
    );
  }
  return filtered[0].version;
}

export const isUserOperationVersion = <
  TEntryPointVersion extends EntryPointVersion
>(
  op: UserOperationStruct,
  version: TEntryPointVersion
): op is UserOperationStruct<TEntryPointVersion> => {
  return getEntryPointVersionFromUserOp(op) === version;
};

import { entryPointRegistry } from "../entrypoint/index.js";
import type {
  EntryPointVersion,
  SupportedEntryPoint,
} from "../entrypoint/types.js";
import type { UserOperationLike } from "../types.js";

export function getEntryPointVersionFromUserOp(op: UserOperationLike) {
  const filtered = Object.values(entryPointRegistry).filter(
    (ep: SupportedEntryPoint<EntryPointVersion>) => ep.isUserOpVersion(op)
  );
  if (filtered.length !== 1) {
    throw new Error(
      "The user operation does not match a unique entry point version."
    );
  }
  return filtered[0].version;
}

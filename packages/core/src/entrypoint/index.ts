import { type Chain } from "viem";
import { EntryPointAbi_v6 } from "../abis/EntryPointAbi_v6.js";
import { EntryPointAbi_v7 } from "../abis/EntryPointAbi_v7.js";
import {
  EntryPointNotFoundError,
  MismatchingEntryPointError,
} from "../errors/entrypoint.js";
import type { UserOperationLike } from "../types.js";
import EntryPoint_v6 from "./0.6.js";
import EntryPoint_v7 from "./0.7.js";
import type {
  DefaultEntryPointVersion,
  EntryPointDef,
  EntryPointDefRegistry,
  EntryPointRegistry,
  EntryPointVersion,
  GetEntryPointOptions,
  SupportedEntryPoint,
} from "./types.js";

export const defaultEntryPointVersion: DefaultEntryPointVersion = "0.6.0";

export const entryPointRegistry: EntryPointRegistry = {
  "0.6.0": EntryPoint_v6,
  "0.7.0": EntryPoint_v7,
};

export const coerceEntryPointVersion = <
  TEntryPointVersion extends EntryPointVersion
>(
  entryPoint: EntryPointRegistry[EntryPointVersion],
  userOperation: UserOperationLike,
  throwable?: boolean
): UserOperationLike<TEntryPointVersion> | undefined => {
  if (entryPoint.isUserOpVersion(userOperation)) {
    return userOperation as UserOperationLike<TEntryPointVersion>;
  }
  if (!throwable) {
    return undefined;
  }
  throw new MismatchingEntryPointError(entryPoint.version, userOperation);
};

export function getEntryPoint<
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion,
  TChain extends Chain = Chain
>(
  chain: TChain,
  options: GetEntryPointOptions<TEntryPointVersion>
): EntryPointDefRegistry<TChain>[TEntryPointVersion];

export function getEntryPoint<
  TEntryPointVersion extends DefaultEntryPointVersion = DefaultEntryPointVersion,
  TChain extends Chain = Chain
>(
  chain: TChain,
  options?: GetEntryPointOptions<TEntryPointVersion>
): EntryPointDefRegistry<TChain>[TEntryPointVersion];

export function getEntryPoint<TChain extends Chain = Chain>(
  chain: TChain,
  options?: GetEntryPointOptions<DefaultEntryPointVersion>
): EntryPointDefRegistry<TChain>[DefaultEntryPointVersion];

export function getEntryPoint<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain = Chain
>(
  chain: TChain,
  options: GetEntryPointOptions<TEntryPointVersion>
): EntryPointDefRegistry<TChain>[EntryPointVersion] {
  const { version, addressOverride } = options ?? {
    version: defaultEntryPointVersion,
  };
  const entryPoint = entryPointRegistry[version ?? defaultEntryPointVersion];
  const address = addressOverride || entryPoint.address[chain.id];
  if (!address) {
    throw new EntryPointNotFoundError(chain, version);
  }

  if (version === "0.6.0") {
    const v6 = entryPoint as SupportedEntryPoint<
      "0.6.0",
      TChain,
      typeof EntryPointAbi_v6
    >;
    return {
      version: v6.version,
      address,
      chain,
      abi: v6.abi,
      getUserOperationHash: (r) =>
        v6.getUserOperationHash(r, address, chain.id),
      packUserOperation: v6.packUserOperation,
      isUserOpVersion: v6.isUserOpVersion,
      coerce: (userOperation, throwable) =>
        coerceEntryPointVersion(v6, userOperation, throwable),
    } as EntryPointDef<"0.6.0", TChain, typeof EntryPointAbi_v6>;
  } else if (version === "0.7.0") {
    const v7 = entryPoint as SupportedEntryPoint<
      "0.7.0",
      TChain,
      typeof EntryPointAbi_v7
    >;
    return {
      version: v7.version,
      address,
      chain,
      abi: v7.abi,
      getUserOperationHash: (r) =>
        v7.getUserOperationHash(r, address, chain.id),
      packUserOperation: v7.packUserOperation,
      isUserOpVersion: v7.isUserOpVersion,
      coerce: (userOperation, throwable) =>
        coerceEntryPointVersion(v7, userOperation, throwable),
    } as EntryPointDef<"0.7.0", TChain, typeof EntryPointAbi_v7>;
  }

  throw new EntryPointNotFoundError(chain, version);
}

// // =================================================================================
// // TODO: Add tests for the following cases

// const chain: Chain = mainnet;

// // 1. left and right hand side version type should match, as well as the param

// // === Error ===
// const ep1_a: EntryPointDef<"0.6.0"> = getEntryPoint(chain, {
//   version: "0.7.0",
// }); // error
// const ep1_b: EntryPointDef<"0.7.0"> = getEntryPoint(chain); // error
// const ep1_c: EntryPointDef<"0.6.0"> = getEntryPoint(chain, {
//   version: "0.7.0",
// }); // error
// const ep1_d: EntryPointDef<"0.6.0"> = getEntryPoint<"0.6.0">(chain, {
//   version: "0.7.0",
// }); // error

// // === Valid ===
// const ep1a: EntryPointDef<"0.6.0"> = getEntryPoint(chain);
// const ep1b: EntryPointDef<"0.6.0"> = getEntryPoint(chain, { version: "0.6.0" });
// const ep1c: EntryPointDef<"0.7.0"> = getEntryPoint(chain, { version: "0.7.0" });
// const ep1d: EntryPointDef<"0.6.0"> = getEntryPoint(chain, {
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
// });
// const ep1e: EntryPointDef<"0.6.0"> = getEntryPoint(chain, {
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
//   version: "0.6.0",
// });
// const ep1f: EntryPointDef<"0.7.0"> = getEntryPoint(chain, {
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
//   version: "0.7.0",
// });

// // 2. If non-default type is specified, version option param of the type is required

// // === Error ===
// const ep2_a: EntryPointDef<"0.7.0"> = getEntryPoint<"0.7.0">(chain); // error
// const ep2_b: EntryPointDef<"0.7.0"> = getEntryPoint<"0.7.0">(chain, {
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
// });

// // === Valid ===
// const ep2a: EntryPointDef<"0.7.0"> = getEntryPoint<"0.7.0">(chain, {
//   version: "0.7.0",
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
// });
// const ep2b: EntryPointDef<"0.6.0"> = getEntryPoint<"0.6.0">(chain, {
//   version: "0.6.0",
// });
// const ep2c: EntryPointDef<"0.6.0"> = getEntryPoint<"0.6.0">(chain);
// const ep2d: EntryPointDef<"0.6.0"> = getEntryPoint<"0.6.0">(chain, {
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
// });
// const ep2e: EntryPointDef<"0.7.0"> = getEntryPoint<"0.7.0">(chain, {
//   version: "0.7.0",
//   addressOverride: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
// });

// // 3. type needs to be only one of EntryPointVersion type not the union type itself

// // === Error ===
// const ep3_a: EntryPointDef<EntryPointVersion> = getEntryPoint(chain, {
//   version: "0.6.0",
// }); // error

// // =================================================================================

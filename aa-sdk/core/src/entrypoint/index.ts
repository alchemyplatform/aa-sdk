import { type Chain } from "viem";
import { EntryPointNotFoundError } from "../errors/entrypoint.js";
import EntryPoint_v6 from "./0.6.js";
import EntryPoint_v7 from "./0.7.js";
import type {
  DefaultEntryPointVersion,
  EntryPointDefRegistry,
  EntryPointRegistry,
  EntryPointVersion,
  GetEntryPointOptions,
} from "./types.js";

export const defaultEntryPointVersion: DefaultEntryPointVersion = "0.6.0";

export const entryPointRegistry: EntryPointRegistry = {
  "0.6.0": EntryPoint_v6,
  "0.7.0": EntryPoint_v7,
};

/**
 * Checks if the given value is a valid key of the EntryPointRegistry.
 *
 * @example
 * ```ts
 * import { isEntryPointVersion } from "@aa-sdk/core";
 *
 * const valid = isEntryPointVersion("0.6.0");
 * const invalid = isEntryPointVersion("0.8.0");
 * ```
 *
 * @param {*} value The value to be checked
 * @returns {boolean} true if the value is a valid key of EntryPointRegistry, false otherwise
 */
export const isEntryPointVersion = (
  value: any
): value is keyof EntryPointRegistry => {
  return Object.keys(entryPointRegistry).includes(value);
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

/**
 * Retrieves the entry point definition for the specified chain and version, falling back to the default version if not provided. Throws an error if the entry point address cannot be found.
 *
 * @example
 * ```ts
 * import { getEntryPoint } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 *
 * const entryPoint060 = getEntryPoint(sepolia);
 * const entryPoint070 = getEntryPoint(sepolia, { version: "0.7.0" });
 * ```
 *
 * @param {Chain} chain The chain for which the entry point is being retrieved
 * @param {GetEntryPointOptions<TEntryPointVersion>} options Options containing the version and address overrides for the entry point
 * @returns {EntryPointDefRegistry<TChain>[EntryPointVersion]} The entry point definition for the specified chain and version
 */
export function getEntryPoint<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain = Chain
>(
  chain: TChain,
  options: GetEntryPointOptions<TEntryPointVersion>
): EntryPointDefRegistry<TChain>[EntryPointVersion] {
  const { version = defaultEntryPointVersion, addressOverride } = options ?? {
    version: defaultEntryPointVersion,
  };

  const entryPoint = entryPointRegistry[version ?? defaultEntryPointVersion];
  const address =
    addressOverride ??
    entryPoint.address[chain.id] ??
    entryPoint.address.default;
  if (!address) {
    throw new EntryPointNotFoundError(chain, version);
  }

  if (entryPoint.version === "0.6.0") {
    return {
      version: entryPoint.version,
      address,
      chain,
      abi: entryPoint.abi,
      getUserOperationHash: (r) =>
        entryPoint.getUserOperationHash(r, address, chain.id),
      packUserOperation: entryPoint.packUserOperation,
    };
  } else if (entryPoint.version === "0.7.0") {
    return {
      version: entryPoint.version,
      address,
      chain,
      abi: entryPoint.abi,
      getUserOperationHash: (r) =>
        entryPoint.getUserOperationHash(r, address, chain.id),
      packUserOperation: entryPoint.packUserOperation,
    };
  }

  throw new EntryPointNotFoundError(chain, version);
}

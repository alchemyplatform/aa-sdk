import type { Address, Hash, Hex } from "viem";
import { encodeAbiParameters, hexToBigInt, keccak256, toHex } from "viem";
import * as chains from "viem/chains";
import type { PublicErc4337Client } from "../client/types.js";
import type {
  DefaultAddressesMap,
  PromiseOrValue,
  UserOperationRequest,
  UserOperationStruct,
} from "../types.js";

/**
 * Utility method for converting a chainId to a {@link chains.Chain} object
 *
 * @param chainId
 * @returns a {@link chains.Chain} object for the given chainId
 * @throws if the chainId is not found
 */
export const getChain = (chainId: number): chains.Chain => {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
  throw new Error("could not find chain");
};

/**
 * Utility function that allows for piping a series of async functions together
 *
 * @param fns - functions to pipe
 * @returns result of the pipe
 */
export const asyncPipe =
  <T>(...fns: ((x: T) => Promise<T>)[]) =>
  async (x: T) => {
    let result = x;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };

// based on @ethersproject/properties, but pulled in here to minize the dependency on ethers
export type Deferrable<T> = {
  [K in keyof T]: PromiseOrValue<T[K]>;
};

/**
 * Await all of the properties of a {@link Deferrable} object
 *
 * @param object - a {@link Deferrable} object
 * @returns the object with its properties resolved
 */
export async function resolveProperties<T>(object: Deferrable<T>): Promise<T> {
  const promises = Object.keys(object).map((key) => {
    const value = object[key as keyof Deferrable<T>];
    return Promise.resolve(value).then((v) => ({ key: key, value: v }));
  });

  const results = await Promise.all(promises);

  return results.reduce((accum, curr) => {
    accum[curr.key as keyof T] = curr.value;
    return accum;
  }, {} as T);
}

/**
 * Recursively converts all values in an object to hex strings
 *
 * @param obj - obj to deep hexlify
 * @returns object with all of its values hexlified
 */
export function deepHexlify(obj: any): any {
  if (typeof obj === "function") {
    return undefined;
  }
  if (obj == null || typeof obj === "string" || typeof obj === "boolean") {
    return obj;
  } else if (typeof obj === "bigint") {
    return toHex(obj);
  } else if (obj._isBigNumber != null || typeof obj !== "object") {
    return toHex(obj).replace(/^0x0/, "0x");
  }
  if (Array.isArray(obj)) {
    return obj.map((member) => deepHexlify(member));
  }
  return Object.keys(obj).reduce(
    (set, key) => ({
      ...set,
      [key]: deepHexlify(obj[key]),
    }),
    {}
  );
}

/**
 * Generates a hash for a UserOperation valid from entrypoint version 0.6 onwards
 *
 * @param request - the UserOperation to get the hash for
 * @param entryPointAddress - the entry point address that will be used to execute the UserOperation
 * @param chainId - the chain on which this UserOperation will be executed
 * @returns the hash of the UserOperation
 */
export function getUserOperationHash(
  request: UserOperationRequest,
  entryPointAddress: Address,
  chainId: bigint
): Hash {
  const encoded = encodeAbiParameters(
    [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
    [keccak256(packUo(request)), entryPointAddress, chainId]
  ) as `0x${string}`;

  return keccak256(encoded);
}

function packUo(request: UserOperationRequest): Hex {
  const hashedInitCode = keccak256(request.initCode);
  const hashedCallData = keccak256(request.callData);
  const hashedPaymasterAndData = keccak256(request.paymasterAndData);

  return encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "bytes32" },
      { type: "bytes32" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes32" },
    ],
    [
      request.sender as Address,
      hexToBigInt(request.nonce),
      hashedInitCode,
      hashedCallData,
      hexToBigInt(request.callGasLimit),
      hexToBigInt(request.verificationGasLimit),
      hexToBigInt(request.preVerificationGas),
      hexToBigInt(request.maxFeePerGas),
      hexToBigInt(request.maxPriorityFeePerGas),
      hashedPaymasterAndData,
    ]
  );
}

// borrowed from ethers.js
export function defineReadOnly<T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K]
): void {
  Object.defineProperty(object, key, {
    enumerable: true,
    value: value,
    writable: false,
  });
}

export async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Utility method for asserting a {@link UserOperationStruct} is a {@link UserOperationRequest}
 *
 * @param request a {@link UserOperationStruct} to validate
 * @returns a type guard that asserts the {@link UserOperationStruct} is a {@link UserOperationRequest}
 */
export function isValidRequest(
  request: UserOperationStruct
): request is UserOperationRequest {
  // These are the only ones marked as optional in the interface above
  return (
    !!request.callGasLimit &&
    !!request.maxFeePerGas &&
    request.maxPriorityFeePerGas != null &&
    !!request.preVerificationGas &&
    !!request.verificationGasLimit
  );
}

const ACCOUNTKIT_DEFAULT_ADDRESSES =
  "https://raw.githubusercontent.com/alchemyplatform/accountkit-defaults/main/chain-addresses.json";

/**
 * Utility method returning the default deployed addresses of account kit related addresses
 * such as simple & light account factory addresses, entrypoint singleton contract address
 * given a {@link chains.Chain} object
 *
 * @param chain - a {@link chains.Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultAddressMap = async (): Promise<Record<
  number,
  DefaultAddressesMap
> | null> => {
  try {
    const res = await fetchWithTimeout(ACCOUNTKIT_DEFAULT_ADDRESSES, 1000);
    if (!res.ok) {
      throw new Error("could not fetch default addresses");
    }
    return (await res.json()) as Record<number, DefaultAddressesMap>;
  } catch (e) {
    return null;
  }
};

/**
 * Utility method returning the entry point contrafct address given a {@link chains.Chain} object
 *
 * @param chain - a {@link chains.Chain} object
 * @returns a {@link abi.Address} for the given chain
 * @throws if the chain doesn't have an address currently deployed
 */
export const getDefaultEntryPointContract = async ({
  chain,
  rpcClient,
}:
  | {
      chain: chains.Chain;
      rpcClient?: never;
    }
  | {
      chain?: never;
      rpcClient: PublicErc4337Client;
    }): Promise<Address> => {
  if (rpcClient) {
    const supportedEntryPoints = await rpcClient.getSupportedEntryPoints();
    if (supportedEntryPoints.length > 0) {
      return supportedEntryPoints[0];
    }
  }

  const _chain = rpcClient?.chain ?? chain!;
  const defaultAddressMap = await getDefaultAddressMap();
  if (defaultAddressMap?.[_chain.id]?.entryPointContractAddress) {
    return defaultAddressMap[_chain.id].entryPointContractAddress as Address;
  }

  switch (_chain.id) {
    case chains.mainnet.id:
    case chains.sepolia.id:
    case chains.goerli.id:
    case chains.polygon.id:
    case chains.polygonMumbai.id:
    case chains.optimism.id:
    case chains.optimismGoerli.id:
    case chains.arbitrum.id:
    case chains.arbitrumGoerli.id:
    case chains.base.id:
    case chains.baseGoerli.id:
      return "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  }
  throw new Error("could not find entry point contract address");
};

export * from "./bigint.js";

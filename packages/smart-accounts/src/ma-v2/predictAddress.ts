import { assertNever } from "@alchemy/common";
import {
  concatHex,
  decodeFunctionData,
  encodePacked,
  getContractAddress,
  isAddressEqual,
  keccak256,
  type Address,
  type Client,
  type Hex,
} from "viem";
import {
  entryPoint07Address,
  type EntryPointVersion,
} from "viem/account-abstraction";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { DefaultAddress } from "./utils/account.js";
import { getSenderFromFactoryData } from "../utils.js";

export type PredictModularAccountV2AddressParams = {
  factoryAddress: Address;
  implementationAddress: Address; // Should be the implementation address of the account type you are predicting the address for.
  salt: bigint;
} & (
  | {
      type: "MA";
      ownerAddress: Address;
      entityId: number;
    }
  | {
      type: "SMA";
      ownerAddress: Address;
    }
);

/**
 * Predicts the address of a modular account V2 based on the provided parameters, which include factory address, salt, and implementation address. This function supports different types of accounts including "SMA" and "MA".
 *
 * @example
 * ```ts
 * import { predictModularAccountV2Address } from "@alchemy/smart-accounts";
 *
 * const accountAddress = predictModularAccountV2Address({
 *   factoryAddress: "0xFactoryAddress" as Address,
 *   implementationAddress: "0xImplementation" as Address,
 *   salt: 0n,
 *   type: "SMA",
 *   ownerAddress: "0xOwner" as Address,
 * });
 * ```
 *
 * @param {PredictModularAccountV2AddressParams} params The parameters for predicting the modular account address, including `factoryAddress`, `salt`, `implementationAddress`, and additional properties based on the account type.
 * @returns {Address} The predicted address for the modular account V2.
 */
export function predictModularAccountV2Address(
  params: PredictModularAccountV2AddressParams,
): Address {
  const { factoryAddress, salt, implementationAddress } = params;

  // Note(v4): prediction for MA is currently untested, because it is not supported as an account type yet.
  // Prior to using this prediction logic, ensure that the counterfactual computation is correct by updating `predictAddress.test.ts` to include a test for MA.
  const { combinedSalt, initcode } = (() => {
    switch (params.type) {
      case "SMA":
        // MAv2 factory uses max uint32 for SMA entityId
        return {
          combinedSalt: getCombinedSaltK1(
            params.ownerAddress,
            salt,
            0xffffffff,
          ),
          initcode: getProxyBytecodeWithImmutableArgs(
            implementationAddress,
            params.ownerAddress,
          ),
        };
      case "MA":
        return {
          combinedSalt: getCombinedSaltK1(
            params.ownerAddress,
            salt,
            params.entityId,
          ),
          initcode: getProxyBytecode(implementationAddress),
        };
      default:
        return assertNever(params, "Unexpected MAv2 type");
    }
  })();

  return getContractAddress({
    from: factoryAddress,
    opcode: "CREATE2",
    salt: combinedSalt,
    bytecode: initcode,
  });
}

function getCombinedSaltK1(
  ownerAddress: Address,
  salt: bigint,
  entityId: number,
): Hex {
  return keccak256(
    encodePacked(
      ["address", "uint256", "uint32"],
      [ownerAddress, salt, entityId],
    ),
  );
}

function getProxyBytecode(implementationAddress: Address): Hex {
  return concatHex([
    "0x603d3d8160223d3973",
    implementationAddress,
    "0x60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3",
  ]);
}

function getProxyBytecodeWithImmutableArgs(
  implementationAddress: Address,
  immutableArgs: Hex,
): Hex {
  return `0x6100513d8160233d3973${implementationAddress.slice(
    2,
  )}60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3${immutableArgs.slice(
    2,
  )}`;
}

export type GetModularAccountV2AddressFromFactoryDataParams = {
  client: Client;
  factoryAddress: Address;
  factoryData: Hex;
  implementationAddress: Address;
  entryPoint?: {
    version: EntryPointVersion;
    address: Address;
  };
};

/**
 * Gets the modular account v2 address from factory data.
 * If the factory is a known default (SMA), decodes the args and predicts without RPC.
 * Otherwise falls back to calling the entry point's getSenderAddress.
 *
 * @param {GetModularAccountV2AddressFromFactoryDataParams} params - The parameters
 * @returns {Promise<Address>} The account address
 */
export async function getModularAccountV2AddressFromFactoryData({
  client,
  factoryAddress,
  factoryData,
  implementationAddress,
  entryPoint = {
    version: "0.7",
    address: entryPoint07Address,
  },
}: GetModularAccountV2AddressFromFactoryDataParams): Promise<Address> {
  // Try SMA factory
  if (isAddressEqual(factoryAddress, DefaultAddress.MAV2_FACTORY)) {
    try {
      const decoded = decodeFunctionData({
        abi: accountFactoryAbi,
        data: factoryData,
      });
      if (decoded.functionName === "createSemiModularAccount") {
        const [decodedOwner, decodedSalt] = decoded.args;
        return predictModularAccountV2Address({
          factoryAddress,
          implementationAddress,
          salt: decodedSalt,
          type: "SMA",
          ownerAddress: decodedOwner,
        });
      }
    } catch {
      // Decode failed, fall through to RPC
    }
  }
  return getSenderFromFactoryData(client, {
    factory: factoryAddress,
    factoryData,
    entryPoint,
  });
}

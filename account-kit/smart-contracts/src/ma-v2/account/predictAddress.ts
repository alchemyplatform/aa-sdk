import {
  encodePacked,
  getContractAddress,
  keccak256,
  type Address,
  type Hex,
} from "viem";

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
  | {
      type: "WebAuthn";
      ownerPublicKey: {
        x: bigint;
        y: bigint;
      };
      entityId: number;
    }
);

/**
 * Predicts the address of a modular account V2 based on the provided parameters, which include factory address, salt, and implementation address. This function supports different types of accounts including "SMA", "MA", and "WebAuthn".
 *
 * @example
 * ```ts
 * import { predictModularAccountV2Address } from "@account-kit/smart-contracts";
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
 */ export function predictModularAccountV2Address(
  params: PredictModularAccountV2AddressParams
): Address {
  const { factoryAddress, salt, implementationAddress } = params;

  let combinedSalt: Hex;
  let initcode: Hex;

  // Note: prediction for MA and WebAuthn is currently untested, because they are not supported as an account type yet.
  // Prior to using this prediction logic, ensure that the counterfactual computation is correct by updating `predictAddress.test.ts` to include a test for MA and WebAuthn.
  switch (params.type) {
    case "SMA":
      // MAv2 factory uses max uint32 for SMA entityId
      combinedSalt = getCombinedSaltK1(params.ownerAddress, salt, 0xffffffff);
      const immutableArgs = params.ownerAddress;
      initcode = getProxyBytecodeWithImmutableArgs(
        implementationAddress,
        immutableArgs
      );
      break;
    case "MA":
      combinedSalt = getCombinedSaltK1(
        params.ownerAddress,
        salt,
        params.entityId
      );

      initcode = getProxyBytecode(implementationAddress);
      break;
    case "WebAuthn":
      const {
        ownerPublicKey: { x, y },
      } = params;

      combinedSalt = keccak256(
        encodePacked(
          ["uint256", "uint256", "uint256", "uint32"],
          [x, y, salt, params.entityId]
        )
      );

      initcode = getProxyBytecode(implementationAddress);

      break;
    default:
      return assertNeverModularAccountV2Type(params);
  }

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
  entityId: number
): Hex {
  return keccak256(
    encodePacked(
      ["address", "uint256", "uint32"],
      [ownerAddress, salt, entityId]
    )
  );
}

function getProxyBytecode(implementationAddress: Address): Hex {
  return `0x603d3d8160223d3973${implementationAddress.slice(
    2
  )}60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3`;
}

function getProxyBytecodeWithImmutableArgs(
  implementationAddress: Address,
  immutableArgs: Hex
): Hex {
  return `0x6100513d8160233d3973${implementationAddress.slice(
    2
  )}60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3${immutableArgs.slice(
    2
  )}`;
}

function assertNeverModularAccountV2Type(_: never): never {
  throw new Error(
    "Unknown modular account type in predictModularAccountV2Address"
  );
}

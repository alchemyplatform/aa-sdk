import {
  concatHex,
  encodeAbiParameters,
  encodeDeployData,
  encodeFunctionData,
  getContractAddress,
  keccak256,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { LightAccountAbi_v1 } from "./abis/LightAccountAbi_v1.js";
import { OZ_ERC1967Proxy_ConstructorAbi } from "./abis/OZ_ERC1967Proxy.js";
import type { LightAccountVersionConfigs } from "./types.js";
import { AccountVersionRegistry, lowerAddress } from "./utils.js";
import { BaseError } from "@alchemy/common";

export type PredictLightAccountAddressParams = {
  factoryAddress: Address;
  salt: bigint;
  ownerAddress: Address;
  version: keyof LightAccountVersionConfigs["LightAccount"];
};

/**
 * Predicts the address of a light account based on provided parameters such as factory address, salt, owner address, and version.
 *
 * @param {PredictLightAccountAddressParams} params The parameters required to predict the light account address, including factory address, salt, owner address, and version
 * @returns {Address} The predicted address of the light account calculated based on the provided parameters
 */
export function predictLightAccountAddress({
  factoryAddress,
  salt,
  ownerAddress,
  version,
}: PredictLightAccountAddressParams): Address {
  const implementationAddress =
    // If we aren't using the default factory address, we compute the implementation address from the factory's `create` deployment.
    // This is accurate for both LA v1 and v2 factories. If we are using the default factory address, we use the implementation address from the registry.
    lowerAddress(factoryAddress) !==
    AccountVersionRegistry.LightAccount[version].addresses.default.factory
      ? getContractAddress({
          from: factoryAddress,
          nonce: 1n,
        })
      : AccountVersionRegistry.LightAccount[version].addresses.default.impl;

  switch (version) {
    case "v1.0.1":
    case "v1.0.2":
    case "v1.1.0":
      // Same proxy initcode for all LA v1 factories
      return getContractAddress({
        from: factoryAddress,
        opcode: "CREATE2",
        salt: toHex(salt, { size: 32 }),
        bytecode: encodeDeployData({
          bytecode: LAv1_PROXY_BYTECODE,
          abi: OZ_ERC1967Proxy_ConstructorAbi,
          args: [
            implementationAddress,
            encodeFunctionData({
              abi: LightAccountAbi_v1,
              functionName: "initialize",
              args: [ownerAddress],
            }),
          ],
        }),
      });

    case "v2.0.0":
      // Logic ported from LA factory v2.0.0
      const combinedSalt = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "uint256" }],
          [ownerAddress, salt],
        ),
      );

      const initCode = getLAv2ProxyBytecode(implementationAddress);

      return getContractAddress({
        from: factoryAddress,
        opcode: "CREATE2",
        salt: combinedSalt,
        bytecode: initCode,
      });

    default:
      assertNeverLightAccountVersion(version);
  }
}

export type PredictMultiOwnerLightAccountAddressParams = {
  factoryAddress: Address;
  salt: bigint;
  ownerAddresses: Address[];
  // There's just one version of the MultiOwnerLightAccount for now, so skip requiring the version as a parameter.
};

// Note: assumes the owner addresses are already deduped, sorted in ascending order, and have the signer address included.
/**
 * Predicts the address of a **Multi-Owner Light Account** given the factory, salt
 * and the set of owner addresses.
 *
 * Internally replicates the CREATE2 calculation performed by the factory so
 * you can obtain the counter-factual account address before deployment (useful
 * for funding or displaying to users).
 *
 * @param {PredictMultiOwnerLightAccountAddressParams} params  Object containing:
 *  – `factoryAddress` Factory contract that will deploy the account.
 *  – `salt` Arbitrary salt used when calling the factory.
 *  – `ownerAddresses` Array of owner EOAs (must be deduped & sorted).
 * @returns {Address} Predicted account address for the multi-owner light account.
 */
export function predictMultiOwnerLightAccountAddress({
  factoryAddress,
  salt,
  ownerAddresses,
}: PredictMultiOwnerLightAccountAddressParams): Address {
  const implementationAddress =
    // If we aren't using the default factory address, we compute the implementation address from the factory's `create` deployment.
    // This is accurate for both LA v1 and v2 factories. If we are using the default factory address, we use the implementation address from the registry.
    factoryAddress !==
    AccountVersionRegistry.MultiOwnerLightAccount["v2.0.0"].addresses.default
      .factory
      ? getContractAddress({
          from: factoryAddress,
          nonce: 1n,
        })
      : AccountVersionRegistry.MultiOwnerLightAccount["v2.0.0"].addresses
          .default.impl;

  const combinedSalt = keccak256(
    encodeAbiParameters(
      [{ type: "address[]" }, { type: "uint256" }],
      [ownerAddresses, salt],
    ),
  );

  const initCode: Hex = getLAv2ProxyBytecode(implementationAddress);

  return getContractAddress({
    from: factoryAddress,
    opcode: "CREATE2",
    salt: combinedSalt,
    bytecode: initCode,
  });
}

const LAv1_PROXY_BYTECODE =
  "0x60406080815261042c908138038061001681610218565b93843982019181818403126102135780516001600160a01b038116808203610213576020838101516001600160401b0394919391858211610213570186601f820112156102135780519061007161006c83610253565b610218565b918083528583019886828401011161021357888661008f930161026e565b813b156101b9577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc80546001600160a01b031916841790556000927fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8480a28051158015906101b2575b61010b575b855160e790816103458239f35b855194606086019081118682101761019e578697849283926101889952602788527f416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c87890152660819985a5b195960ca1b8a8901525190845af4913d15610194573d9061017a61006c83610253565b91825281943d92013e610291565b508038808080806100fe565b5060609250610291565b634e487b7160e01b84526041600452602484fd5b50826100f9565b855162461bcd60e51b815260048101859052602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608490fd5b600080fd5b6040519190601f01601f191682016001600160401b0381118382101761023d57604052565b634e487b7160e01b600052604160045260246000fd5b6001600160401b03811161023d57601f01601f191660200190565b60005b8381106102815750506000910152565b8181015183820152602001610271565b919290156102f357508151156102a5575090565b3b156102ae5790565b60405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606490fd5b8251909150156103065750805190602001fd5b6044604051809262461bcd60e51b825260206004830152610336815180928160248601526020868601910161026e565b601f01601f19168101030190fdfe60806040523615605f5773ffffffffffffffffffffffffffffffffffffffff7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54166000808092368280378136915af43d82803e15605b573d90f35b3d90fd5b73ffffffffffffffffffffffffffffffffffffffff7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54166000808092368280378136915af43d82803e15605b573d90f3fea26469706673582212205da2750cd2b0cadfd354d8a1ca4752ed7f22214c8069d852f7dc6b8e9e5ee66964736f6c63430008150033" satisfies Hex;

// Bytecode from https://github.com/Vectorized/solady/blob/c6e5238e5f3b621789c59e1a443f43b6606394b2/src/utils/LibClone.sol#L721

function getLAv2ProxyBytecode(implementationAddress: Address): Hex {
  return concatHex([
    "0x603d3d8160223d3973",
    implementationAddress,
    "0x60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3",
  ]);
}

function assertNeverLightAccountVersion(version: never): never {
  throw new BaseError(`Unknown light account version: ${version}`);
}

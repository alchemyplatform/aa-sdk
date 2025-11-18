import {
  type Address,
  getContractAddress,
  encodeAbiParameters,
  keccak256,
  concatHex,
  type Hex,
} from "viem";
import { DefaultAddress } from "./utils/account.js";

export type PredictMultiOwnerModularAccountV1AddressParams = {
  salt: bigint;
  /* Owner addresses must be already deduped, sorted in ascending order, and have the signer address included. */
  ownerAddresses: Address[];
  factoryAddress?: Address;
};

// TODO(jh): add jsdoc & tests.
export const predictMultiOwnerModularAccountV1Address = ({
  salt,
  ownerAddresses,
  factoryAddress = DefaultAddress.MULTI_OWNER_MAV1_FACTORY,
}: PredictMultiOwnerModularAccountV1AddressParams): Address => {
  // TODO(jh): is this correct?
  const combinedSalt = keccak256(
    encodeAbiParameters(
      [{ type: "address[]" }, { type: "uint256" }],
      [ownerAddresses, salt],
    ),
  );

  // TODO(jh): is this correct?
  const initcode = getProxyBytecode("0xTODO"); // TODO(jh): how to get this impl address?

  return getContractAddress({
    from: factoryAddress,
    opcode: "CREATE2",
    salt: combinedSalt,
    bytecode: initcode,
  });
};

// TODO(jh): is this correct?
function getProxyBytecode(implementationAddress: Address): Hex {
  return concatHex([
    "0x603d3d8160223d3973",
    implementationAddress,
    "0x60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3",
  ]);
}

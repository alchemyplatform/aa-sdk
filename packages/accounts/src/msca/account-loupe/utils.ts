import { encodePacked, parseAbiParameters, type Address, type Hex } from "viem";

export const encodeFunctionReference = (
  pluginAddress: Address,
  functionId: Hex
) => {
  return encodePacked(parseAbiParameters("address, uint8"), [
    pluginAddress,
    functionId,
  ]);
};

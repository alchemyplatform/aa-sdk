import { encodePacked, type Address, type Hex } from "viem";

export const encodeFunctionReference = (
  pluginAddress: Address,
  functionId: Hex
) => {
  return encodePacked(
    ["address", "uint8"],
    [pluginAddress, Number(functionId)]
  );
};

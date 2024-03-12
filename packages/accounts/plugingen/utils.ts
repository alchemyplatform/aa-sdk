import { type AbiFunction } from "abitype";
import { getAbiItem, type Abi, type AbiItem, type Address } from "viem";

export const executionAbiConst = (name: string) =>
  `${name}ExecutionFunctionAbi`;

export const extractExecutionAbi = (
  executionFunctions: readonly Address[],
  abi: Abi,
): AbiFunction[] => {
  return executionFunctions.map((f) => {
    const item = getAbiItem({
      abi: abi,
      name: f,
    }) as AbiItem;

    if (item.type !== "function") {
      throw new Error(
        "execution function not mapping to a function in the ABI",
        { cause: JSON.stringify(item, null, 2) },
      );
    }

    return item;
  });
};

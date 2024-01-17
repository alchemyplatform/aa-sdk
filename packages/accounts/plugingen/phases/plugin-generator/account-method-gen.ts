import { pascalCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../types";
import { extractExecutionAbi } from "../../utils.js";

export const AccountMethodGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbiConst = `${contract.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);
  const hasViewFunction =
    executionAbi.filter((n) => n.stateMutability === "view").length > 0;

  addImport("viem", { name: "GetFunctionArgs", isType: true });
  addImport("viem", { name: "encodeFunctionData" });
  addImport("../../types.js", { name: "IMSCA", isType: true });

  const accountFunctions = executionAbi.map((n) => {
    const methodContent = [];
    const argsParamString =
      n.inputs.length > 0
        ? `{ args }: GetFunctionArgs<typeof ${executionAbiConst}, "${n.name}">`
        : "";
    const argsEncodeString = n.inputs.length > 0 ? "args," : "";
    const isViewFunction = n.stateMutability === "view";

    methodContent.push(dedent`
      encode${pascalCase(n.name)}Data: (${argsParamString}) => {
          return encodeFunctionData({
              abi: ${executionAbiConst},
              functionName: "${n.name}",
              ${argsEncodeString}
          });
      }
    `);

    if (isViewFunction) {
      methodContent.push(dedent`
        read${pascalCase(n.name)}: async (${argsParamString}) => {
          return account.rpcProvider.readContract({
            address: await account.getAddress(),
            abi: ${executionAbiConst},
            functionName: "${n.name}",
            ${argsEncodeString}
          });
        }
      `);
    }

    return methodContent.join(",\n\n");
  });

  input.content.push(dedent`
    accountMethods: (${
      hasViewFunction ? "account" : "_account"
    }: IMSCA<any, any, any>) => ({ ${accountFunctions.join(",\n\n")} })
  `);

  return input;
};

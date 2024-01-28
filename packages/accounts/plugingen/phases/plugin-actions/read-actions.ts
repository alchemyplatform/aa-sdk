import { pascalCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../types";
import { extractExecutionAbi } from "../../utils.js";

export const AccountReadActionsGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport, addType } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbiConst = `${contract.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);

  addImport("viem", { name: "GetFunctionArgs", isType: true });
  addImport("viem", { name: "encodeFunctionData" });
  addImport("viem", { name: "Hex", isType: true });

  const accountFunctionActionDefs: string[] = [];

  const accountFunctions = executionAbi.map((n) => {
    const methodContent = [];
    const argsParamString = n.inputs.length > 0 ? `{ args }` : "";
    const argsEncodeString = n.inputs.length > 0 ? "args," : "";
    const isViewFunction = n.stateMutability === "view";

    accountFunctionActionDefs.push(
      dedent`encode${pascalCase(
        n.name
      )}: (args: GetFunctionArgs<typeof ${executionAbiConst}, "${
        n.name
      }">) => Hex`
    );
    methodContent.push(dedent`
      encode${pascalCase(n.name)}(${argsParamString}) {
          return encodeFunctionData({
              abi: ${executionAbiConst},
              functionName: "${n.name}",
              ${argsEncodeString}
          });
      }
    `);

    const readArgsParamString =
      n.inputs.length > 0
        ? `{ args, account = client.account }`
        : "{ account = client.account }";
    if (isViewFunction) {
      addImport("viem", { name: "ReadContractReturnType", isType: true });
      input.hasReadMethods = true;
      accountFunctionActionDefs.push(
        n.inputs.length > 0
          ? dedent`read${pascalCase(
              n.name
            )}: (args: GetFunctionArgs<typeof ${executionAbiConst}, "${
              n.name
            }"> & GetAccountParameter<TAccount>) => Promise<ReadContractReturnType<typeof ${executionAbiConst}, "${
              n.name
            }">>`
          : dedent`read${pascalCase(
              n.name
            )}: (args: GetAccountParameter<TAccount>) => Promise<ReadContractReturnType<typeof ${executionAbiConst}, "${
              n.name
            }">>`
      );

      methodContent.push(dedent`
        async read${pascalCase(n.name)} (${readArgsParamString}) {
          if (!account) {
            throw new AccountNotFoundError();
          }

          return client.readContract({
            address: account.address,
            abi: ${executionAbiConst},
            functionName: "${n.name}",
            ${argsEncodeString}
          });
        }
      `);
    }

    return methodContent.join(",\n\n");
  });

  const typeName = input.hasReadMethods
    ? "ReadAndEncodeActions<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>"
    : "ReadAndEncodeActions";

  addType(
    typeName,
    dedent`{
    ${accountFunctionActionDefs.join(";\n\n")}
  }`
  );
  input.content.push(...accountFunctions);

  return input;
};

import { pascalCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../types";
import { extractExecutionAbi } from "../../utils.js";

export const AccountReadActionsGenPhase: Phase = async (input) => {
  const { pluginConfig, contract, addImport, addType } = input;
  const { executionFunctions } = await contract.read.pluginManifest();
  const executionAbiConst = `${pluginConfig.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(
    executionFunctions,
    pluginConfig.abi,
  );

  addImport("viem", { name: "EncodeFunctionDataParameters", isType: true });
  addImport("viem", { name: "encodeFunctionData" });
  addImport("viem", { name: "Hex", isType: true });

  const accountFunctionActionDefs: string[] = [];

  const accountFunctions = executionAbi.map((n) => {
    const methodContent: string[] = [];
    const argsParamString = n.inputs.length > 0 ? `{ args }` : "";
    const argsEncodeString = n.inputs.length > 0 ? "args," : "";
    const isViewFunction = n.stateMutability === "view";

    const encodeMethodName = `encode${pascalCase(n.name)}`;
    accountFunctionActionDefs.push(
      dedent`${encodeMethodName}: (args: Pick<EncodeFunctionDataParameters<typeof ${executionAbiConst}, "${n.name}">, "args">) => Hex`,
    );
    methodContent.push(dedent`
      ${encodeMethodName}(${argsParamString}) {
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
      const readMethodName = `read${pascalCase(n.name)}`;
      accountFunctionActionDefs.push(
        n.inputs.length > 0
          ? dedent`${readMethodName}: (
            args: Pick<EncodeFunctionDataParameters<typeof ${executionAbiConst}, "${n.name}">, "args"> &
              GetAccountParameter<TAccount>
          ) => Promise<ReadContractReturnType<typeof ${executionAbiConst}, "${n.name}">>`
          : dedent`${readMethodName}: (args: GetAccountParameter<TAccount>) =>
              Promise<ReadContractReturnType<typeof ${executionAbiConst}, "${n.name}">>`,
      );

      methodContent.push(dedent`
        async ${readMethodName} (${readArgsParamString}) {
          if (!account) {
            throw new AccountNotFoundError();
          }

          if (!isSmartAccountClient(client)) {
            throw new IncompatibleClientError("SmartAccountClient", "${readMethodName}", client);
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
    ? `ReadAndEncodeActions<
        TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
      >`
    : "ReadAndEncodeActions";

  addType(
    typeName,
    dedent`{
    ${accountFunctionActionDefs.join(";\n\n")}
  }`,
  );
  input.content.push(...accountFunctions);

  return input;
};

import { camelCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../types";
import { extractExecutionAbi } from "../../utils.js";
import { ManagementActionsGenPhase } from "../plugin-actions/management-actions.js";
import { AccountReadActionsGenPhase } from "../plugin-actions/read-actions.js";

export const ClientDecoratorGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport, addType } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbiConst = `${contract.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);

  addImport("viem", { name: "GetFunctionArgs", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "Chain", isType: true });
  addImport("@alchemy/aa-core", {
    name: "SmartContractAccount",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "UserOperationOverrides",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "SmartAccountClient",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "GetAccountParameter",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "SendUserOperationResult",
    isType: true,
  });

  const providerFunctionDefs: string[] = [];
  const providerFunctions = executionAbi
    .filter((n) => n.stateMutability !== "view")
    .map((n) => {
      const argsParamString =
        n.inputs.length > 0
          ? dedent`{ 
                args, 
                overrides, 
                account = client.account 
            }: GetFunctionArgs<typeof ${executionAbiConst}, "${n.name}"> & { overrides?: UserOperationOverrides; } & GetAccountParameter<TAccount>`
          : "";
      const argsEncodeString = n.inputs.length > 0 ? "args," : "";

      providerFunctionDefs.push(dedent`
        ${camelCase(
          n.name
        )}: (args: GetFunctionArgs<typeof ${executionAbiConst}, "${
        n.name
      }"> & { overrides?: UserOperationOverrides; } & GetAccountParameter<TAccount>) => Promise<SendUserOperationResult>
      `);
      return dedent`
            ${camelCase(n.name)}: (${argsParamString}) => {
              if (!account) {
                throw new Error("account is required");
              }  

              const data = encodeFunctionData({
                abi: ${executionAbiConst},
                functionName: "${n.name}",
                ${argsEncodeString}
              });

              return client.sendUserOperation({ data, overrides, account });
            }
          `;
    });

  addType(
    "ExecutionActions<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>",
    dedent`{
      ${providerFunctionDefs.join(";\n\n")}
    }`
  );

  // TODO: async pipe this
  await ManagementActionsGenPhase({
    ...input,
    content: providerFunctions,
  });

  await AccountReadActionsGenPhase({
    ...input,
    content: providerFunctions,
  });

  input.content.push(dedent`
    actions<
        TTransport extends Transport = Transport,
        TChain extends Chain | undefined = Chain | undefined,
        TAccount extends SmartContractAccount | undefined =
        | SmartContractAccount
        | undefined
    >(
        client: SmartAccountClient<TTransport, TChain, TAccount>
    ): ${contract.name}Actions<TAccount> { return { ${providerFunctions.join(
    ",\n\n"
  )} }; }
    `);

  return input;
};

import { asyncPipe } from "@alchemy/aa-core";
import { camelCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../types";
import { extractExecutionAbi } from "../../utils.js";
import { ManagementActionsGenPhase } from "./management-actions.js";
import { AccountReadActionsGenPhase } from "./read-actions.js";

export const PluginActionsGenPhase: Phase = async (input) => {
  const { pluginConfig, contract, addImport, addType } = input;
  const { executionFunctions } = await contract.read.pluginManifest();
  const executionAbiConst = `${pluginConfig.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(
    executionFunctions,
    pluginConfig.abi
  );

  addImport("viem", { name: "EncodeFunctionDataParameters", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "Chain", isType: true });
  addImport("viem", { name: "Client", isType: true });
  addImport("@alchemy/aa-core", {
    name: "SmartContractAccount",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "UserOperationOverrides",
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
  addImport("@alchemy/aa-core", { name: "AccountNotFoundError" });
  addImport("@alchemy/aa-core", { name: "isSmartAccountClient" });
  addImport("@alchemy/aa-core", { name: "IncompatibleClientError" });
  addImport("@alchemy/aa-core", { name: "GetContextParameter", isType: true });

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
              }`
          : dedent`{ 
              overrides, 
              account = client.account 
          }`;
      const argsEncodeString = n.inputs.length > 0 ? "args," : "";

      providerFunctionDefs.push(dedent`
          ${camelCase(
            n.name
          )}: (args: Pick<EncodeFunctionDataParameters<typeof ${executionAbiConst}, "${
        n.name
      }">, "args"> & { 
            overrides?: UserOperationOverrides; 
          } & GetAccountParameter<TAccount> & GetContextParameter<TContext>) => Promise<SendUserOperationResult>
        `);
      const methodName = camelCase(n.name);
      return dedent`
              ${methodName}(${argsParamString}) {
                if (!account) {
                  throw new AccountNotFoundError();
                } 
                if (!isSmartAccountClient(client)) {
                  throw new IncompatibleClientError("SmartAccountClient", "${methodName}", client);
                }
  
                const uo = encodeFunctionData({
                  abi: ${executionAbiConst},
                  functionName: "${n.name}",
                  ${argsEncodeString}
                });
  
                return client.sendUserOperation({ uo, overrides, account, context });
              }
            `;
    });

  addType(
    "ExecutionActions<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined, TContext extends Record<string, any> | undefined = Record<string, any> | undefined>",
    dedent`{
        ${providerFunctionDefs.join(";\n\n")}
      }`
  );

  const { hasReadMethods } = await asyncPipe(
    ManagementActionsGenPhase,
    AccountReadActionsGenPhase
  )({
    ...input,
    content: providerFunctions,
  });

  addType(
    `${pluginConfig.name}Actions<TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined, TContext extends Record<string, any> | undefined = Record<string, any> | undefined>`,
    dedent`
    ExecutionActions<TAccount, TContext> & ManagementActions<TAccount, TContext> & ReadAndEncodeActions${
      hasReadMethods ? "<TAccount>" : ""
    }
  `,
    true
  );

  input.content.push(dedent`
    export const ${camelCase(pluginConfig.name)}Actions: <
        TTransport extends Transport = Transport,
        TChain extends Chain | undefined = Chain | undefined,
        TAccount extends SmartContractAccount | undefined =
            | SmartContractAccount
            | undefined,
        TContext extends Record<string, any> | undefined = Record<string, any> | undefined
    >(
        client: Client<TTransport, TChain, TAccount>
    ) => ${
      pluginConfig.name
    }Actions<TAccount, TContext> = (client) => ({ ${providerFunctions.join(
    ",\n"
  )} });
  `);

  return input;
};

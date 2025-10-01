import { asyncPipe } from "@aa-sdk/core";
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
    pluginConfig.abi,
  );

  addImport("viem", { name: "EncodeFunctionDataParameters", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "Chain", isType: true });
  addImport("viem", { name: "Client", isType: true });
  addImport("@aa-sdk/core", {
    name: "SmartContractAccount",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "GetAccountParameter",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "SendUserOperationResult",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "GetEntryPointFromAccount",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "UserOperationOverridesParameter",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "UserOperationContext",
    isType: true,
  });
  addImport("@aa-sdk/core", { name: "AccountNotFoundError" });
  addImport("@aa-sdk/core", { name: "isSmartAccountClient" });
  addImport("@aa-sdk/core", { name: "IncompatibleClientError" });
  addImport("@aa-sdk/core", { name: "GetContextParameter", isType: true });

  const providerFunctionDefs: string[] = [];
  const providerFunctions = executionAbi
    .filter((n) => n.stateMutability !== "view")
    .map((n) => {
      const argsParamString =
        n.inputs.length > 0
          ? dedent`{
                args,
                overrides,
                context,
                account = client.account
            }`
          : dedent`{
                overrides,
                context,
                account = client.account
            }`;
      const argsEncodeString = n.inputs.length > 0 ? "args," : "";

      providerFunctionDefs.push(dedent`
          ${camelCase(
            n.name,
          )}: (args: Pick<EncodeFunctionDataParameters<typeof ${executionAbiConst}, "${
            n.name
          }">, "args"> & UserOperationOverridesParameter<TEntryPointVersion> &
          GetAccountParameter<TAccount> & GetContextParameter<TContext>) =>
            Promise<SendUserOperationResult<TEntryPointVersion>>
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
    `ExecutionActions<
      TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
      TContext extends UserOperationContext | undefined = UserOperationContext | undefined,
      TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
    >`,
    dedent`{
        ${providerFunctionDefs.join(";\n\n")}
      }`,
  );

  const { hasReadMethods } = await asyncPipe(
    ManagementActionsGenPhase,
    AccountReadActionsGenPhase,
  )({
    ...input,
    content: providerFunctions,
  });

  addType(
    `${pluginConfig.name}Actions<
      TAccount extends SmartContractAccount | undefined =
          | SmartContractAccount
          | undefined,
      TContext extends UserOperationContext | undefined = UserOperationContext | undefined>`,
    dedent`
    ExecutionActions<TAccount, TContext> & ManagementActions<TAccount, TContext> & ReadAndEncodeActions${
      hasReadMethods ? "<TAccount>" : ""
    }
  `,
    true,
  );

  input.content.push(dedent`
    export const ${camelCase(pluginConfig.name)}Actions: <
        TTransport extends Transport = Transport,
        TChain extends Chain | undefined = Chain | undefined,
        TAccount extends SmartContractAccount | undefined =
            | SmartContractAccount
            | undefined,
        TContext extends UserOperationContext | undefined = UserOperationContext | undefined
    >(
      client: Client<TTransport, TChain, TAccount>
    ) => ${
      pluginConfig.name
    }Actions<TAccount, TContext> = (client) => ({ ${providerFunctions.join(
      ",\n",
    )} });
  `);

  return input;
};

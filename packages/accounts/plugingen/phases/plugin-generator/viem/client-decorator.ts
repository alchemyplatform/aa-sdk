import { camelCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../../types";
import { extractExecutionAbi } from "../../../utils.js";
import { ViemAccountDecoratorPhase } from "./account-decorator.js";
import { ViemInstallMethodGenPhase } from "./install-method-gen.js";

export const ViemClientMethodGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbiConst = `${contract.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);

  addImport("viem", { name: "GetFunctionArgs", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "Chain", isType: true });
  addImport("@alchemy/aa-core/viem", {
    name: "SmartContractAccount",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "UserOperationOverrides",
    isType: true,
  });
  addImport("@alchemy/aa-core/viem", {
    name: "SmartAccountClient",
    isType: true,
  });
  addImport("@alchemy/aa-core/viem", {
    name: "GetAccountParameter",
    isType: true,
  });

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

  // TODO: async pipe this
  await ViemInstallMethodGenPhase({
    ...input,
    content: providerFunctions,
  });

  await ViemAccountDecoratorPhase({
    ...input,
    content: providerFunctions,
  });

  input.content.push(dedent`
    export function ${contract.name}ClientDecorator<
        TTransport extends Transport = Transport,
        TChain extends Chain = Chain,
        TAccount extends SmartContractAccount | undefined =
        | SmartContractAccount
        | undefined
    >(
        client: SmartAccountClient<TTransport, TChain, TAccount>
    ) { return { ${providerFunctions.join(",\n\n")} }; }
    `);

  return input;
};

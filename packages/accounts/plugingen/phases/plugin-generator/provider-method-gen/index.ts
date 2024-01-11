import { camelCase } from "change-case";
import dedent from "dedent";
import type { Phase } from "../../../types";
import { extractExecutionAbi } from "../../../utils.js";
import { InstallMethodGenPhase } from "./install-method-gen.js";

export const ProviderMethodGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbiConst = `${contract.name}ExecutionFunctionAbi`;
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);

  addImport("viem", { name: "GetFunctionArgs", isType: true });
  addImport("@alchemy/aa-core", {
    name: "UserOperationOverrides",
    isType: true,
  });
  addImport("@alchemy/aa-core", { name: "SupportedTransports", isType: true });
  addImport("@alchemy/aa-core", {
    name: "ISmartAccountProvider",
    isType: true,
  });

  const providerFunctions = executionAbi
    .filter((n) => n.stateMutability !== "view")
    .map((n) => {
      const argsParamString =
        n.inputs.length > 0
          ? `{ args }: GetFunctionArgs<typeof ${executionAbiConst}, "${n.name}">, overrides?: UserOperationOverrides`
          : "";
      const argsEncodeString = n.inputs.length > 0 ? "args," : "";

      return dedent`
            ${camelCase(n.name)}: (${argsParamString}) => {
              const callData = encodeFunctionData({
                abi: ${executionAbiConst},
                functionName: "${n.name}",
                ${argsEncodeString}
              });

              return provider.sendUserOperation(callData, overrides);
            }
          `;
    });

  await InstallMethodGenPhase({
    ...input,
    content: providerFunctions,
  });

  input.content.push(dedent`
    providerMethods: <
        TTransport extends SupportedTransports,
        P extends ISmartAccountProvider<TTransport> & { account: IMSCA<TTransport> }
    >(
        provider: P
    ) => ({ ${providerFunctions.join(",\n\n")} }),
    `);
  return input;
};

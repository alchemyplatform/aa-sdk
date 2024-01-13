import { asyncPipe } from "@alchemy/aa-core";
import dedent from "dedent";
import type { Phase } from "../../types";
import { AccountMethodGenPhase } from "./account-method-gen.js";
import { MetaGenPhase } from "./meta-gen.js";
import { ProviderMethodGenPhase } from "./provider-method-gen/index.js";

export const PluginGeneratorPhase: Phase = async (input) => {
  const pluginPhases: Phase[] = [
    MetaGenPhase,
    AccountMethodGenPhase,
    ProviderMethodGenPhase,
  ];
  const { contract, addImport } = input;
  addImport("../types.js", { name: "Plugin", isType: true });

  const result = await asyncPipe(...pluginPhases)({
    ...input,
    content: [],
  });

  input.content.push(dedent`
    const ${contract.name}_ = {
        ${result.content.join(",\n")}
    }; 

    export const ${contract.name}: Plugin<ReturnType<typeof ${
    contract.name
  }_["accountMethods"]>, ReturnType<typeof ${
    contract.name
  }_["providerMethods"]>> = ${contract.name}_;
  `);

  return input;
};

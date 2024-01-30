import { asyncPipe } from "@alchemy/aa-core";
import dedent from "dedent";
import type { Phase } from "../../types";
import { GetContractGenPhase } from "./get-contract-gen.js";
import { MetaGenPhase } from "./meta-gen.js";

export const PluginGeneratorPhase: Phase = async (input) => {
  const pluginPhases: Phase[] = [MetaGenPhase, GetContractGenPhase];
  const { contract, addImport } = input;

  const result = await asyncPipe(...pluginPhases)({
    ...input,
    content: [],
  });

  addImport("../types.js", { name: "Plugin", isType: true });

  input.content.push(dedent`
    export const ${contract.name}: Plugin<typeof ${contract.name}Abi> = {
        ${result.content.join(",\n")}
    };
  `);

  return input;
};

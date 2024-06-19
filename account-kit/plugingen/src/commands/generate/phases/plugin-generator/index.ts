import { asyncPipe } from "@aa-sdk/core";
import dedent from "dedent";
import type { Phase } from "../../types";
import { GetContractGenPhase } from "./get-contract-gen.js";
import { MetaGenPhase } from "./meta-gen.js";

export const PluginGeneratorPhase: Phase = async (input) => {
  const pluginPhases: Phase[] = [MetaGenPhase, GetContractGenPhase];
  const { pluginConfig, addImport } = input;

  const result = await asyncPipe(...pluginPhases)({
    ...input,
    content: [],
  });

  addImport("@account-kit/smart-contracts", { name: "Plugin", isType: true });

  input.content.push(dedent`
    export const ${pluginConfig.name}: Plugin<typeof ${
    pluginConfig.name
  }Abi> = {
        ${result.content.join(",\n")}
    };
  `);

  return input;
};

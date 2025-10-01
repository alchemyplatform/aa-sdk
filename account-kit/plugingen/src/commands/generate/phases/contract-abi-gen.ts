import dedent from "dedent";
import type { Phase } from "../types";

export const ContractAbiGenPhase: Phase = async (input) => {
  const { content, pluginConfig } = input;
  content.push(dedent`
    export const ${pluginConfig.name}Abi = ${JSON.stringify(
      pluginConfig.abi,
    )} as const;
  `);
  return input;
};

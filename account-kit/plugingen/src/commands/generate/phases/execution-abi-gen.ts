import dedent from "dedent";
import type { Phase } from "../types";
import { executionAbiConst, extractExecutionAbi } from "../utils.js";

export const ExecutionAbiGenPhase: Phase = async (input) => {
  const { contract, content, pluginConfig } = input;

  const { executionFunctions } = await contract.read.pluginManifest();
  const executionAbi = extractExecutionAbi(
    executionFunctions,
    pluginConfig.abi
  );

  content.push(dedent`
    export const ${executionAbiConst(pluginConfig.name)} = ${JSON.stringify(
    executionAbi
  )} as const;
  `);
  return input;
};

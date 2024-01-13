import dedent from "dedent";
import type { Phase } from "../types";
import { executionAbiConst, extractExecutionAbi } from "../utils.js";

export const ExecutionAbiGenPhase: Phase = async (input) => {
  const { contract, content, plugin } = input;

  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);

  content.push(dedent`
    export const ${executionAbiConst(contract.name)} = ${JSON.stringify(
    executionAbi
  )} as const;
  `);
  return input;
};

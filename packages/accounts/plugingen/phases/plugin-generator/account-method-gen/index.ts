import dedent from "dedent";
import type { Phase } from "../../../types";
import { extractExecutionAbi } from "../../../utils.js";
import { OldAccountMethodPhase } from "./old-methods.js";

export const AccountMethodGenPhase: Phase = async (input) => {
  const { plugin, contract, addImport } = input;
  const { executionFunctions } = await plugin.read.pluginManifest();
  const executionAbi = extractExecutionAbi(executionFunctions, contract.abi);
  const hasViewFunction =
    executionAbi.filter((n) => n.stateMutability === "view").length > 0;

  addImport("../../types.js", { name: "IMSCA", isType: true });

  const { content: oldMethods } = await OldAccountMethodPhase({
    ...input,
    content: [],
  });

  input.content.push(dedent`
    accountMethods: (${
      hasViewFunction ? "account" : "_account"
    }: IMSCA<any, any, any>) => ({ ${oldMethods.join(",\n\n")} })
  `);

  return input;
};

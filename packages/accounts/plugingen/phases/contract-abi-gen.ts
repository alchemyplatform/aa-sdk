import dedent from "dedent";
import type { Phase } from "../types";

export const ContractAbiGenPhase: Phase = async (input) => {
  const { contract, content } = input;
  content.push(dedent`
    export const ${contract.name}Abi = ${JSON.stringify(contract.abi)} as const;
  `);
  return input;
};

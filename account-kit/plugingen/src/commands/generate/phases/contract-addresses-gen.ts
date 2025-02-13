import dedent from "dedent";
import type { Address } from "viem";
import type { Phase } from "../types";

export const ContractAddressesGenPhase: Phase = async (input) => {
  const { pluginConfig, content, addImport } = input;

  addImport("viem", { name: "Address", isType: true });
  content.push(dedent`
    const addresses = {${Object.entries(
      pluginConfig.addresses as Record<number, Address>
    ).reduce(
      (prev, [chainId, addr]) => (prev += `${chainId}: "${addr}" as Address, `),
      ""
    )}} as Record<number, Address>;
  `);
  return input;
};

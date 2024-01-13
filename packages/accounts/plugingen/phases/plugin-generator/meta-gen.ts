import dedent from "dedent";
import type { Address } from "viem";
import type { Phase } from "../../types";

export const MetaGenPhase: Phase = async (input) => {
  const { plugin, content, contract, addImport } = input;
  const { name, version } = await plugin.read.pluginMetadata();

  addImport("viem", { name: "Address", isType: true });
  content.push(dedent`
    meta: {
        name: "${name}",
        version: "${version}",
        addresses: {${Object.entries(
          contract.address as Record<number, Address>
        ).reduce(
          (prev, [chainId, addr]) =>
            (prev += `${chainId}: "${addr}" as Address, `),
          ""
        )}} as Record<number, Address>,
    }
  `);

  return input;
};

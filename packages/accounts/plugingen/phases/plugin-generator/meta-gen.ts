import dedent from "dedent";
import type { Phase } from "../../types";

export const MetaGenPhase: Phase = async (input) => {
  const { plugin, content } = input;
  const { name, version } = await plugin.read.pluginMetadata();

  content.push(dedent`
    meta: {
        name: "${name}",
        version: "${version}",
        addresses,
    }
  `);

  return input;
};

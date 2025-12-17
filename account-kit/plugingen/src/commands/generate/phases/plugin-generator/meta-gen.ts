import dedent from "dedent";
import type { Phase } from "../../types";

export const MetaGenPhase: Phase = async (input) => {
  const { contract, content } = input;
  const { name, version } = await contract.read.pluginMetadata();

  content.push(dedent`
    meta: {
        name: ${toTsString(name)},
        version: ${toTsString(version)},
        addresses,
    }
  `);

  return input;
};

function toTsString(v: string) {
  return (
    JSON.stringify(v)
      // These two are valid in JSON but can behave badly in JS source in some contexts (e.g. in template strings)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029")
  );
}

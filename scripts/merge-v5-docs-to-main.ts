#!/usr/bin/env node

import fs from "fs";
import yaml from "js-yaml";

/**
 * Merges v5 SDK Reference sections from v5's docs.yml into main's docs.yml.
 *
 * Usage:
 *   npx tsx scripts/merge-v5-docs-to-main.ts \
 *     --v5-docs-yml docs/docs.yml \
 *     --main-docs-yml main-branch/docs/docs.yml
 *
 * This script:
 * 1. Reads the "SDK Reference" section from both docs.yml files
 * 2. Removes any existing v5 package sections from main (for idempotency)
 * 3. Appends v5 package sections to main's SDK Reference
 * 4. Writes the updated main docs.yml
 */

interface ParsedArgs {
  v5DocsYml: string;
  mainDocsYml: string;
}

interface SdkReferenceBlock {
  startIndex: number;
  endIndex: number;
  indent: number;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let v5DocsYml = "";
  let mainDocsYml = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--v5-docs-yml" && args[i + 1]) {
      v5DocsYml = args[++i];
    } else if (args[i] === "--main-docs-yml" && args[i + 1]) {
      mainDocsYml = args[++i];
    }
  }

  if (!v5DocsYml || !mainDocsYml) {
    console.error(
      "Usage: npx tsx scripts/merge-v5-docs-to-main.ts --v5-docs-yml <path> --main-docs-yml <path>",
    );
    process.exit(1);
  }

  return { v5DocsYml, mainDocsYml };
}

/**
 * Find the "SDK Reference" section boundaries in a docs.yml file.
 * Uses the same line-scanning approach as generate-typedoc-yaml.ts.
 *
 * @param {string[]} lines - The lines of the docs.yml file
 * @returns {SdkReferenceBlock} The start/end indices and indentation level of the SDK Reference block
 */
function findSdkReferenceBlock(lines: string[]): SdkReferenceBlock {
  let startIndex = -1;
  let endIndex = -1;
  let indent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("section: SDK Reference")) {
      startIndex = i;
      indent = line.search(/\S/) / 2;
      continue;
    }

    if (startIndex !== -1 && endIndex === -1) {
      const lineIndent = line.search(/\S/) / 2;
      if (line.trim() && lineIndent <= indent && line.includes("- section:")) {
        endIndex = i;
        break;
      }
    }
  }

  if (startIndex === -1) {
    throw new Error('Could not find "SDK Reference" section in docs.yml');
  }

  if (endIndex === -1) {
    endIndex = lines.length;
  }

  return { startIndex, endIndex, indent };
}

/**
 * Extract the SDK Reference contents array from YAML lines.
 * Parses the YAML block and returns the contents array.
 *
 * @param {string[]} lines - The lines of the docs.yml file
 * @param {SdkReferenceBlock} block - The block boundaries to extract from
 * @returns {unknown[]} The contents array of the SDK Reference section
 */
function extractSdkReferenceContents(
  lines: string[],
  block: SdkReferenceBlock,
): unknown[] {
  const yamlBlock = lines.slice(block.startIndex, block.endIndex).join("\n");

  // The block starts with "- section: SDK Reference" at some indentation.
  // We need to parse just this section. Strip the leading indent and the "- " list marker.
  const trimmedBlock = yamlBlock
    .split("\n")
    .map((line) => {
      // Remove the base indentation
      const baseIndent = "  ".repeat(block.indent);
      if (line.startsWith(baseIndent)) {
        return line.slice(baseIndent.length);
      }
      return line;
    })
    .join("\n");

  // Parse as YAML array element
  const parsed = yaml.load(trimmedBlock) as {
    section: string;
    contents?: unknown[];
  }[];

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [];
  }

  return parsed[0].contents ?? [];
}

function main(): void {
  const { v5DocsYml, mainDocsYml } = parseArgs();

  console.log("Reading v5 docs.yml:", v5DocsYml);
  console.log("Reading main docs.yml:", mainDocsYml);

  const v5Content = fs.readFileSync(v5DocsYml, "utf-8");
  const mainContent = fs.readFileSync(mainDocsYml, "utf-8");

  const v5Lines = v5Content.split("\n");
  const mainLines = mainContent.split("\n");

  // Find SDK Reference blocks in both files
  const v5Block = findSdkReferenceBlock(v5Lines);
  const mainBlock = findSdkReferenceBlock(mainLines);

  console.log(
    `v5 SDK Reference: lines ${v5Block.startIndex + 1}-${v5Block.endIndex}`,
  );
  console.log(
    `main SDK Reference: lines ${mainBlock.startIndex + 1}-${mainBlock.endIndex}`,
  );

  // Extract SDK Reference contents from both
  const v5Contents = extractSdkReferenceContents(v5Lines, v5Block);
  const mainContents = extractSdkReferenceContents(mainLines, mainBlock);

  // Build set of v5 section names actually present in v5's output.
  // Only filter by names that are in the v5 docs.yml, not all PACKAGE_DISPLAY_NAMES,
  // to avoid collisions (e.g. v4's "Infra" for @account-kit/infra vs v5's "Infra" for @alchemy/aa-infra).
  const v5SectionNames = new Set(
    v5Contents.map((c: any) => c.section as string),
  );

  console.log(`v5 package sections: ${Array.from(v5SectionNames).join(", ")}`);

  // Filter out existing v5 sections from main (idempotency)
  const filteredMainContents = mainContents.filter(
    (item: any) => !v5SectionNames.has(item.section),
  );

  // v5Contents already only contains packages from PACKAGES_INCLUDED_IN_NAV
  // (generated by generate-typedoc-yaml.ts which respects that list)
  const filteredV5Contents = v5Contents;

  console.log(
    `Including v5 sections: ${filteredV5Contents.map((c: any) => c.section).join(", ")}`,
  );

  // Merge: v5 sections first (beta), then main (v4) sections
  const mergedContents = [...filteredV5Contents, ...filteredMainContents];

  // Build the merged SDK Reference structure
  const mergedSdkReference = {
    section: "SDK Reference",
    contents: mergedContents,
  };

  // Serialize back to YAML
  const mergedYaml = yaml.dump([mergedSdkReference], {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });

  // Indent to match main's indentation level
  const indentedYaml = mergedYaml
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return line;
      const baseIndent = "  ".repeat(mainBlock.indent);
      return `${baseIndent}${line}`;
    })
    .slice(0, -1); // Remove trailing empty line from yaml.dump

  // Splice into main's lines
  const newLines = [
    ...mainLines.slice(0, mainBlock.startIndex),
    ...indentedYaml,
    ...mainLines.slice(mainBlock.endIndex),
  ];

  // Preserve original file ending
  const result = mainContent.endsWith("\n")
    ? newLines.join("\n") + "\n"
    : newLines.join("\n");

  fs.writeFileSync(mainDocsYml, result);

  console.log(`\n✅ Updated ${mainDocsYml} with merged SDK Reference`);
  console.log(
    `   ${filteredMainContents.length} v4 sections + ${filteredV5Contents.length} v5 sections = ${mergedContents.length} total`,
  );
}

main();

#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

/**
 * Script to automatically update the SDK Reference section in docs.yml from TypeDoc-generated MDX files
 * This script scans the TypeDoc output directory, generates the appropriate YAML structure,
 * and directly updates the docs.yml file by replacing the existing SDK Reference section.
 */

const TYPEDOC_DIR = "./docs/pages/reference";
const DOCS_YML_FILE = "./docs/docs.yml";

interface FileItem {
  type: "file";
  name: string;
  path: string;
  mdxPath: string;
}

interface DirectoryItem {
  type: "directory";
  name: string;
  path: string;
  children: (FileItem | DirectoryItem)[];
}

type ScanItem = FileItem | DirectoryItem;

interface YamlPage {
  page: string;
  path: string;
}

interface YamlSection {
  section: string;
  contents: (YamlPage | YamlSection)[];
}

interface YamlPackageSection {
  section: string;
  path: string;
  contents: YamlSection[];
}

interface SDKReference {
  section: "SDK Reference";
  contents: YamlPackageSection[];
}

type PackageDisplayNames = Record<string, string>;
type TypeSections = Record<string, string>;

const PACKAGE_DISPLAY_NAMES: Record<string, string> = {
  "aa-infra": "Infra",
  common: "Common",
  "smart-accounts": "Smart Accounts",
  "wallet-apis": "Wallet APIs (BETA)",
} as const;

// TODO: Add other packages (aa-infra, common, smart-accounts) to the nav once they are stable
const PACKAGES_INCLUDED_IN_NAV: string[] = ["wallet-apis"];

const TYPE_SECTIONS: TypeSections = {
  functions: "Functions",
  classes: "Classes",
  interfaces: "Interfaces",
  enumerations: "Enumerations",
  "type-aliases": "Type Aliases",
  variables: "Variables",
} as const;

/**
 * Recursively scan directory and return file structure
 *
 * @param {string} dirPath - The directory path to scan
 * @param {string} basePath - The base path for relative paths
 * @returns {ScanItem[]} Array of file/directory objects
 */
function scanDirectory(dirPath: string, basePath: string = ""): ScanItem[] {
  const items: ScanItem[] = [];

  if (!fs.existsSync(dirPath)) {
    return items;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Skip certain directories (but not exports for wallet-client)
      if (["_media"].includes(entry.name)) {
        continue;
      }

      items.push({
        type: "directory",
        name: entry.name,
        path: relativePath,
        children: scanDirectory(fullPath, relativePath),
      });
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".mdx") &&
      entry.name !== "README.mdx"
    ) {
      const nameWithoutExt = entry.name.replace(".mdx", "");
      items.push({
        type: "file",
        name: nameWithoutExt,
        path: relativePath.replace(".mdx", ""),
        mdxPath: `wallets/pages/reference/${relativePath}`,
      });
    }
  }

  return items;
}

/**
 * Convert file name to display name (capitalize and handle special cases)
 *
 * @param {string} fileName - The file name to convert
 * @returns {string} The display name
 */
function toDisplayName(fileName: string): string {
  const specialCases: Record<string, string> = {
    createConfig: "createConfig",
    useAccount: "useAccount",
    useSigner: "useSigner",
    AlchemyAccountProvider: "AlchemyAccountProvider",
  };

  if (specialCases[fileName]) {
    return specialCases[fileName];
  }

  return fileName;
}

/**
 * Determine if a function should be categorized as a component (React components)
 *
 * @param {string} fileName - The function name
 * @param {string} packageName - The package name
 * @returns {boolean} True if it should be categorized as a component
 */
function isReactComponent(fileName: string, packageName: string): boolean {
  // React components typically start with uppercase letter
  const isUpperCase = fileName[0] === fileName[0].toUpperCase();

  // Known React components
  const reactComponents = [
    "AlchemyAccountProvider",
    "AuthCard",
    "Dialog",
    "UiConfigProvider",
  ];

  return (
    (packageName === "react" || packageName === "react-native") &&
    (isUpperCase || reactComponents.includes(fileName))
  );
}

/**
 * Generate YAML structure for a package section
 *
 * @param {string} packageName - The package name (aa-infra, common, etc.)
 * @param {DirectoryItem} packageData - The package data structure
 * @param {string} packagePath - The full package path
 * @returns {YamlPackageSection} The generated package section structure
 */
function generatePackageSection(
  packageName: string,
  packageData: DirectoryItem,
  packagePath: string,
): YamlPackageSection {
  const displayName =
    PACKAGE_DISPLAY_NAMES[packageName] || packageName;

  const section: YamlPackageSection = {
    section: displayName,
    path: `wallets/pages/reference/${packagePath}/README.mdx`,
    contents: [],
  };

  // Process each type directory (functions, classes, etc.)
  for (const typeDir of packageData.children) {
    if (typeDir.type !== "directory") continue;

    const typeName = typeDir.name;
    const typeDisplayName = TYPE_SECTIONS[typeName];

    if (!typeDisplayName) continue;

    const typeSection: YamlSection = {
      section: typeDisplayName,
      contents: [],
    };

    // Handle classes specially - they might have nested structure
    if (typeName === "classes") {
      for (const classItem of typeDir.children) {
        if (classItem.type === "file") {
          // Simple class file
          typeSection.contents.push({
            page: toDisplayName(classItem.name),
            path: classItem.mdxPath,
          });
        } else if (classItem.type === "directory") {
          // Class with methods - create subsection
          const classSection: YamlSection = {
            section: toDisplayName(classItem.name),
            contents: [],
          };

          for (const methodItem of classItem.children) {
            if (methodItem.type === "file") {
              classSection.contents.push({
                page: toDisplayName(methodItem.name),
                path: methodItem.mdxPath,
              });
            }
          }

          if (classSection.contents.length > 0) {
            typeSection.contents.push(classSection);
          }
        }
      }
    } else if (typeName === "functions") {
      // For functions, separate components, hooks, and regular functions
      const components: YamlPage[] = [];
      const hooks: YamlPage[] = [];
      const functions: YamlPage[] = [];

      for (const item of typeDir.children) {
        if (item.type === "file") {
          if (isReactComponent(item.name, packageName)) {
            components.push({
              page: toDisplayName(item.name),
              path: item.mdxPath,
            });
          } else if (
            item.name.startsWith("use") &&
            (packageName === "react" || packageName === "react-native")
          ) {
            hooks.push({
              page: toDisplayName(item.name),
              path: item.mdxPath,
            });
          } else {
            functions.push({
              page: toDisplayName(item.name),
              path: item.mdxPath,
            });
          }
        }
      }

      if (components.length > 0) {
        section.contents.push({
          section: "Components",
          contents: components,
        });
      }

      if (hooks.length > 0) {
        section.contents.push({
          section: "Hooks",
          contents: hooks,
        });
      }

      // Add functions to the current typeSection
      typeSection.contents = functions;
    } else {
      // For other types (interfaces, etc.), just list files
      for (const item of typeDir.children) {
        if (item.type === "file") {
          typeSection.contents.push({
            page: toDisplayName(item.name),
            path: item.mdxPath,
          });
        }
      }
    }

    if (typeSection.contents.length > 0) {
      section.contents.push(typeSection);
    }
  }

  return section;
}

/**
 * Main function to generate the complete SDK Reference structure
 *
 * @returns {SDKReference} The complete SDK Reference structure
 */
function generateSDKReference(): SDKReference {
  console.log("Scanning TypeDoc directory:", TYPEDOC_DIR);

  const structure = scanDirectory(TYPEDOC_DIR);
  const sdkReference: SDKReference = {
    section: "SDK Reference",
    contents: [],
  };

  for (const topLevel of structure) {
    if (topLevel.type !== "directory") continue;

    const packageName = topLevel.name;

    if (["_media", "modules.mdx", "README.mdx"].includes(packageName)) {
      continue;
    }

    // Only include packages that are ready for the nav
    if (!PACKAGES_INCLUDED_IN_NAV.includes(packageName)) {
      continue;
    }

    // Each top-level directory is a package (e.g., aa-infra, common)
    // Look for src/ directly inside
    let srcDir = topLevel.children.find(
      (child): child is DirectoryItem =>
        child.type === "directory" && child.name === "src",
    );

    if (!srcDir) continue;

    // Handle special cases for packages which have exports subdirectory
    let packagePath = `${packageName}/src`;
    if (packageName === "wallet-apis" || packageName === "infra") {
      const exportsDir = srcDir.children.find(
        (child): child is DirectoryItem =>
          child.type === "directory" && child.name === "exports",
      );
      if (exportsDir) {
        srcDir = exportsDir;
        packagePath = `${packageName}/src/exports`;
      }
    }

    const packageSection = generatePackageSection(
      packageName,
      srcDir,
      packagePath,
    );

    if (packageSection.contents.length > 0) {
      sdkReference.contents.push(packageSection);
    }
  }

  return sdkReference;
}

/**
 * Replace the SDK Reference section in docs.yml with the generated content
 *
 * @param {SDKReference} sdkReference - The generated SDK Reference structure
 * @returns {void}
 */
function updateDocsYml(sdkReference: SDKReference): void {
  const docsContent = fs.readFileSync(DOCS_YML_FILE, "utf-8");
  const lines = docsContent.split("\n");

  let startIndex = -1;
  let endIndex = -1;
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("section: SDK Reference")) {
      startIndex = i;
      // Calculate the indentation level of the SDK Reference section
      currentIndent = line.search(/\S/) / 2;
      continue;
    }

    if (startIndex !== -1 && endIndex === -1) {
      // Look for the next section at the same indentation level
      const lineIndent = line.search(/\S/) / 2;
      if (
        line.trim() &&
        lineIndent <= currentIndent &&
        line.includes("- section:")
      ) {
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

  console.log(
    `Found SDK Reference section from line ${startIndex + 1} to ${endIndex}`,
  );

  const sdkReferenceYaml = yaml.dump([sdkReference], {
    indent: 2,
    lineWidth: -1, // Disable line wrapping
    noRefs: true,
    sortKeys: false,
  });

  const indentedYaml = sdkReferenceYaml
    .split("\n")
    .map((line, index) => {
      if (line.trim() === "") return line;
      const baseIndent = "  ".repeat(currentIndent);
      return `${baseIndent}${line}`;
    })
    .slice(0, -1);

  const newLines = [
    ...lines.slice(0, startIndex),
    ...indentedYaml,
    ...lines.slice(endIndex),
  ];

  fs.writeFileSync(DOCS_YML_FILE, newLines.join("\n") + "\n");

  console.log(`✅ Updated ${DOCS_YML_FILE} with new SDK Reference structure`);
}

function main(): void {
  try {
    console.log("Generating SDK Reference structure...");

    const sdkReference = generateSDKReference();

    console.log(`📊 Found ${sdkReference.contents.length} packages`);

    console.log("\n📋 Package Summary:");
    for (const pkg of sdkReference.contents) {
      console.log(`  - ${pkg.section}: ${pkg.contents.length} sections`);
    }

    console.log(`\n🔄 Updating ${DOCS_YML_FILE}...`);
    updateDocsYml(sdkReference);

    console.log(
      "\n✅ Successfully updated docs.yml with new SDK Reference structure!",
    );
    console.log(
      "💡 The SDK Reference section has been automatically replaced with the TypeDoc-generated content.",
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error updating SDK Reference:", errorMessage);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSDKReference, updateDocsYml };
export type {
  FileItem,
  DirectoryItem,
  ScanItem,
  YamlPage,
  YamlSection,
  YamlPackageSection,
  SDKReference,
  PackageDisplayNames,
  TypeSections,
};

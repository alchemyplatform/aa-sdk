#!/usr/bin/env node

import fs from "fs";
import path from "path";

/**
 * Script to automatically update the SDK Reference section in docs.yml from TypeDoc-generated MDX files
 * This script scans the TypeDoc output directory, generates the appropriate YAML structure,
 * and directly updates the docs.yml file by replacing the existing SDK Reference section.
 */

// Configuration
const TYPEDOC_DIR = "./docs/pages/reference/typedoc";
const DOCS_YML_FILE = "./docs/docs.yml";

// Type definitions
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

type PackageDisplayNames = Record<string, Record<string, string>>;
type TypeSections = Record<string, string>;

// Package name mapping for better display names
const PACKAGE_DISPLAY_NAMES: PackageDisplayNames = {
  "aa-sdk": {
    core: "AA-SDK core",
    ethers: "AA-SDK ethers",
  },
  "account-kit": {
    core: "Other Javascript Frameworks",
    infra: "Infra",
    react: "React",
    "react-native": "React Native",
    "rn-signer": "RN Signer",
    signer: "Signer",
    "smart-contracts": "Smart contracts",
    "wallet-client": "Wallet client",
  },
} as const;

// Type section ordering and display names
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
        mdxPath: `wallets/pages/reference/typedoc/${relativePath}`,
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
  // Handle special cases
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
 * @param {string} packageName - The main package name (aa-sdk, account-kit)
 * @param {string} subPackageName - The sub-package name (core, react, etc.)
 * @param {DirectoryItem} packageData - The package data structure
 * @param {string} packagePath - The full package path
 * @returns {YamlPackageSection} The generated package section structure
 */
function generatePackageSection(
  packageName: string,
  subPackageName: string,
  packageData: DirectoryItem,
  packagePath: string,
): YamlPackageSection {
  const displayName =
    PACKAGE_DISPLAY_NAMES[packageName]?.[subPackageName] ||
    `${packageName}/${subPackageName}`;

  const section: YamlPackageSection = {
    section: displayName,
    path: `wallets/pages/reference/typedoc/${packagePath}/README.mdx`,
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
          if (isReactComponent(item.name, subPackageName)) {
            components.push({
              page: toDisplayName(item.name),
              path: item.mdxPath,
            });
          } else if (
            item.name.startsWith("use") &&
            (subPackageName === "react" || subPackageName === "react-native")
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

      // Add components section if we have any
      if (components.length > 0) {
        section.contents.push({
          section: "Components",
          contents: components,
        });
      }

      // Add hooks section if we have any
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

  // Process each top-level directory (aa-sdk, account-kit)
  for (const topLevel of structure) {
    if (topLevel.type !== "directory") continue;

    const packageName = topLevel.name;

    // Skip certain directories
    if (["_media", "modules.mdx", "README.mdx"].includes(packageName)) {
      continue;
    }

    // Process each package within the top-level directory
    for (const packageDir of topLevel.children) {
      if (packageDir.type !== "directory") continue;

      const fullPackagePath = `${packageName}/${packageDir.name}/src`;

      // Find the src directory
      let srcDir = packageDir.children.find(
        (child): child is DirectoryItem =>
          child.type === "directory" && child.name === "src",
      );

      if (!srcDir) continue;

      // Handle special case for wallet-client which has exports subdirectory
      let actualPackagePath = fullPackagePath;
      if (packageDir.name === "wallet-client") {
        const exportsDir = srcDir.children.find(
          (child): child is DirectoryItem =>
            child.type === "directory" && child.name === "exports",
        );
        if (exportsDir) {
          srcDir = exportsDir;
          actualPackagePath = `${packageName}/${packageDir.name}/src/exports`;
        }
      }

      const packageSection = generatePackageSection(
        packageName,
        packageDir.name,
        srcDir,
        actualPackagePath,
      );

      if (packageSection.contents.length > 0) {
        sdkReference.contents.push(packageSection);
      }
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
  // Read the existing docs.yml file
  const docsContent = fs.readFileSync(DOCS_YML_FILE, "utf-8");
  const lines = docsContent.split("\n");

  // Find the start and end of the SDK Reference section
  let startIndex = -1;
  let endIndex = -1;
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("section: SDK Reference")) {
      startIndex = i;
      // Calculate the indentation level of the SDK Reference section
      currentIndent = line.search(/\S/) / 2; // Assuming 2 spaces per indent level
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

  // If no end found, assume it goes to the end of file
  if (endIndex === -1) {
    endIndex = lines.length;
  }

  console.log(
    `Found SDK Reference section from line ${startIndex + 1} to ${endIndex}`,
  );

  // Generate the new SDK Reference YAML content with proper indentation
  // The SDK Reference should be formatted as a list item at the current indentation level
  const sdkReferenceYaml = toYAMLListItem(sdkReference, currentIndent).split(
    "\n",
  );

  // Replace the section
  const newLines = [
    ...lines.slice(0, startIndex),
    ...sdkReferenceYaml.slice(0, -1), // Remove last empty line
    ...lines.slice(endIndex),
  ];

  // Write back to the file
  fs.writeFileSync(DOCS_YML_FILE, newLines.join("\n"));

  console.log(`✅ Updated ${DOCS_YML_FILE} with new SDK Reference structure`);
}

/**
 * Convert JavaScript object to YAML list item with proper indentation
 *
 * @param {unknown} obj - The object to convert to YAML
 * @param {number} indent - The current indentation level
 * @returns {string} The YAML string representation as a list item
 */
function toYAMLListItem(obj: unknown, indent: number = 0): string {
  const spaces = "  ".repeat(indent);
  let yaml = "";

  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (i === 0) {
        // First property gets the list item prefix
        yaml += `${spaces}- ${key}:`;
      } else {
        // Subsequent properties are indented to align with the first property
        yaml += `${spaces}  ${key}:`;
      }

      if (Array.isArray(value)) {
        yaml += "\n" + toYAML(value, indent + 1);
      } else if (typeof value === "object" && value !== null) {
        yaml += "\n" + toYAML(value, indent + 1);
      } else {
        yaml += ` ${value}\n`;
      }
    }
  }

  return yaml;
}

/**
 * Convert JavaScript object to YAML string with proper indentation
 *
 * @param {unknown} obj - The object to convert to YAML
 * @param {number} indent - The current indentation level
 * @returns {string} The YAML string representation
 */
function toYAML(obj: unknown, indent: number = 0): string {
  const spaces = "  ".repeat(indent);
  let yaml = "";

  if (Array.isArray(obj)) {
    for (const item of obj) {
      yaml += `${spaces}- `;
      if (typeof item === "object" && item !== null) {
        yaml += "\n" + toYAML(item, indent + 1);
      } else {
        yaml += `${item}\n`;
      }
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      yaml += `${spaces}${key}:`;
      if (Array.isArray(value)) {
        yaml += "\n" + toYAML(value, indent + 1);
      } else if (typeof value === "object" && value !== null) {
        yaml += "\n" + toYAML(value, indent + 1);
      } else {
        yaml += ` ${value}\n`;
      }
    }
  }

  return yaml;
}

/**
 * Main execution
 *
 * @returns {void}
 */
function main(): void {
  try {
    console.log("Generating SDK Reference structure...");

    const sdkReference = generateSDKReference();

    console.log(`📊 Found ${sdkReference.contents.length} packages`);

    // Display summary
    console.log("\n📋 Package Summary:");
    for (const pkg of sdkReference.contents) {
      console.log(`  - ${pkg.section}: ${pkg.contents.length} sections`);
    }

    // Update docs.yml directly
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

// Run the script
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

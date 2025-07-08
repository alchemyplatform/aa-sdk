// @ts-check
// This script processes JSDoc MDX include statements in MDX files
// Usage: // [!jsdoc-mdx package-name:function-name]
import fs from "fs";
import path from "path";

/**
 * Recursively find all files matching a pattern in a directory
 *
 * @param {string} dir - Directory to search
 * @param {string} pattern - File pattern to match (e.g., "*.mdx")
 * @returns {string[]} - Array of matching file paths
 */
const findFiles = (dir, pattern) => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (file.endsWith(pattern.replaceAll("*", ""))) {
      results.push(filePath);
    }
  }

  return results;
};

/**
 * Load JSDoc MDX registry from all packages
 *
 * @returns {object} Combined registry of all JSDoc MDX content
 */
const loadJSDocMDXRegistry = () => {
  const registryFiles = [];

  // Find all JSDoc MDX registry files in the reference directory
  const referenceDir = path.resolve(process.cwd(), "docs/pages/reference");

  // Recursively find all jsdoc-mdx-registry.json files
  const findRegistryFiles = (dir) => {
    if (!fs.existsSync(dir)) {
      return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findRegistryFiles(filePath);
      } else if (file === "jsdoc-mdx-registry.json") {
        registryFiles.push(filePath);
      }
    }
  };

  findRegistryFiles(referenceDir);

  if (registryFiles.length === 0) {
    console.warn(`No JSDoc MDX registry files found in ${referenceDir}`);
    return {};
  }

  // Combine all registry files
  const combinedRegistry = {};

  for (const registryFile of registryFiles) {
    try {
      const registryContent = fs.readFileSync(registryFile, "utf8");
      const registryData = JSON.parse(registryContent);

      // Merge the registry data
      Object.assign(combinedRegistry, registryData);

      console.log(`Loaded JSDoc MDX registry from ${registryFile}`);
    } catch (error) {
      console.error(
        `Error loading JSDoc MDX registry from ${registryFile}: ${error.message}`
      );
    }
  }

  return combinedRegistry;
};

const mdxFiles = findFiles("docs", "*.mdx");
const jsDocRegistry = loadJSDocMDXRegistry();

// Regex to match JSDoc MDX include statements
// Format: // [!jsdoc-mdx package-name:function-name]
const jsDocMDXRegex = /\s*\/\/\s*\[!jsdoc-mdx\s+([^\]]+)\]\s*/g;

for (const mdxFile of mdxFiles) {
  let content = fs.readFileSync(mdxFile, "utf8");

  const matches = [...content.matchAll(jsDocMDXRegex)];
  if (matches.length === 0) {
    continue;
  }

  content = content.replace(jsDocMDXRegex, (match, mdxReference) => {
    const trimmedRef = mdxReference.trim();

    // Check if the MDX content exists in the registry
    if (!jsDocRegistry[trimmedRef]) {
      console.warn(`JSDoc MDX not found: ${trimmedRef} in file ${mdxFile}`);
      return `\n<!-- JSDoc MDX not found: ${trimmedRef} -->\n`;
    }

    const mdxEntry = jsDocRegistry[trimmedRef];

    // Return the full MDX content
    return `\n${mdxEntry.mdxContent}\n`;
  });

  fs.writeFileSync(mdxFile, content);
}

console.log(`Processed ${mdxFiles.length} MDX files for JSDoc MDX includes`);

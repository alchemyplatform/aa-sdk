// @ts-check
// This script is executed during a GitHub workflow that otherwise doesn't need to install dependencies
// So not using glob or Typescript is purely to optimize CD runtime (plus all types are inferred)
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
 * Find generated JSDoc MDX file for a given package and function name
 *
 * @param {string} packageName - Package name (e.g., "@account-kit/core")
 * @param {string} functionName - Function name (e.g., "createSmartAccountClient")
 * @returns {string|null} - Path to the generated MDX file or null if not found
 */
const findJSDocMdxFile = (packageName, functionName) => {
  // Convert package name to path segment (remove @ and keep / as is)
  const packagePath = packageName.replace("@", "");

  // Try different possible locations for the generated file
  const possiblePaths = [
    `docs/pages/reference/${packagePath}/functions/${functionName}.mdx`,
    `docs/pages/reference/${packagePath}/hooks/${functionName}.mdx`,
    `docs/pages/reference/${packagePath}/classes/${functionName}.mdx`,
    `docs/pages/reference/${packagePath}/components/${functionName}.mdx`,
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
};

/**
 * Extract content from generated JSDoc MDX file (removes frontmatter)
 *
 * @param {string} filePath - Path to the generated MDX file
 * @returns {string} - Content without frontmatter
 */
const extractJSDocContent = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");

  // Remove frontmatter (everything between first --- and second ---)
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
  content = content.replace(frontmatterRegex, "");

  return content.trim();
};

const mdxFiles = findFiles("docs", "*.mdx");

for (const mdxFile of mdxFiles) {
  let content = fs.readFileSync(mdxFile, "utf8");

  // Handle code includes (existing functionality)
  const snippetRegex = /\s*\/\/\s*\[!include\s+([^\]]+)\]\s*/g;
  const codeMatches = [...content.matchAll(snippetRegex)];

  if (codeMatches.length > 0) {
    content = content.replace(snippetRegex, (match, includePath) => {
      const [filePath, region] = includePath.split(":");

      const fullPath = path.resolve(process.cwd(), filePath.trim());

      let fileContent = fs.readFileSync(fullPath, "utf8");

      if (region) {
        const regionStart = fileContent.indexOf(
          `// [!region ${region.trim()}]`
        );
        const regionEnd = fileContent.indexOf(
          `// [!endregion ${region.trim()}]`
        );

        if (regionStart !== -1 && regionEnd !== -1) {
          fileContent = fileContent
            .substring(
              regionStart + `// [!region ${region.trim()}]`.length,
              regionEnd
            )
            .trim();
        } else {
          throw new Error(`Region "${region.trim()}" not found in ${fullPath}`);
        }
      }

      return `\n${fileContent}\n`;
    });
  }

  // Handle JSDoc MDX includes (new functionality)
  const jsdocMdxRegex = /\s*\/\/\s*\[!jsdoc-mdx\s+([^\]]+)\]\s*/g;
  const jsdocMatches = [...content.matchAll(jsdocMdxRegex)];

  if (jsdocMatches.length > 0) {
    content = content.replace(jsdocMdxRegex, (match, includeSpec) => {
      const [packageName, functionName] = includeSpec.split(":");

      if (!packageName || !functionName) {
        throw new Error(
          `Invalid jsdoc-mdx include format: "${includeSpec}". Expected format: "package:function"`
        );
      }

      const jsdocPath = findJSDocMdxFile(
        packageName.trim(),
        functionName.trim()
      );

      if (!jsdocPath) {
        throw new Error(
          `JSDoc MDX file not found for ${packageName.trim()}:${functionName.trim()}`
        );
      }

      const jsdocContent = extractJSDocContent(jsdocPath);

      return `\n${jsdocContent}\n`;
    });
  }

  // Only write the file if we made changes
  if (codeMatches.length > 0 || jsdocMatches.length > 0) {
    fs.writeFileSync(mdxFile, content);
  }
}

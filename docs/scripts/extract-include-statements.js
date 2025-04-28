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
    } else if (file.endsWith(pattern.replace("*", ""))) {
      results.push(filePath);
    }
  }

  return results;
};

const mdxFiles = findFiles("docs", "*.mdx");

for (const mdxFile of mdxFiles) {
  let content = fs.readFileSync(mdxFile, "utf8");

  const snippetRegex = /\s*\/\/\s*\[!include\s+([^\]]+)\]\s*/g;

  const matches = [...content.matchAll(snippetRegex)];
  if (matches.length === 0) {
    continue;
  }

  content = content.replace(snippetRegex, (match, includePath) => {
    const [filePath, region] = includePath.split(":");

    const fullPath = path.resolve(process.cwd(), filePath.trim());

    let fileContent = fs.readFileSync(fullPath, "utf8");

    if (region) {
      const regionStart = fileContent.indexOf(`// [!region ${region.trim()}]`);
      const regionEnd = fileContent.indexOf(`// [!endregion ${region.trim()}]`);

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

  fs.writeFileSync(mdxFile, content);
}

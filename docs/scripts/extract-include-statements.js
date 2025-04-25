// @ts-check
// js to avoid needing to install dependencies during CD + all types are inferred
import fs from "fs";
import { glob } from "glob";
import path from "path";

const mdxFiles = glob.sync("docs/**/*.mdx");

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

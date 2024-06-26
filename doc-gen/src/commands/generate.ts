import { resolveReExport } from "eslint-plugin-eslint-rules/exports";
import { findUp } from "find-up";
import { default as fs } from "fs-extra";
import * as path from "node:path";
import { resolve } from "pathe";
import ts from "typescript";
import * as logger from "../logger.js";
import { functionTemplate } from "../templates/functionTemplate.js";

export type GenerateOptions = {
  in: string;
  out: string;
};

export async function generate(options: GenerateOptions) {
  const sourceFilePath = path.resolve(process.cwd(), options.in);
  const outputFilePath = path.resolve(process.cwd(), options.out);
  logger.info(
    `Generating documentation for ${sourceFilePath} and ouputing to ${outputFilePath}`
  );

  const sourceFile = getSourceFile(sourceFilePath);
  if (!sourceFile) {
    logger.error(`File not found: ${sourceFilePath}`);
    return;
  }

  const packageJSON = await getPackageJson(sourceFilePath);
  if (!packageJSON) {
    logger.error(`Could not find package.json for ${sourceFilePath}`);
    return;
  }

  sourceFile.forEachChild((node) => {
    // for now we only process re-exports
    if (
      !ts.isExportDeclaration(node) ||
      !node.moduleSpecifier ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      !(node.exportClause && ts.isNamedExports(node.exportClause))
    ) {
      return;
    }
    const exportedFilePath = path.resolve(
      path.dirname(sourceFilePath),
      node.moduleSpecifier.text.replace(".js", ".ts")
    );

    node.exportClause.elements.forEach((element) => {
      generateDocumentation(
        element.name.text,
        exportedFilePath,
        outputFilePath,
        packageJSON.name
      );
    });
  });
}

async function generateDocumentation(
  importedName: string,
  sourceFilePath: string,
  outputFilePath: string,
  packageName: string
) {
  const sourceFile = getSourceFile(sourceFilePath);
  if (!sourceFile) {
    return;
  }
  const node = resolveReExport(sourceFilePath, importedName);
  if (!node) {
    return;
  }

  if (ts.isClassDeclaration(node)) {
    logger.warn("Class declarations are not supported yet");
    return;
  }

  const jsdocCommentAndTags = ts.getJSDocCommentsAndTags(node);
  if (jsdocCommentAndTags.length === 0) return;

  const documentation = functionTemplate(
    importedName,
    packageName,
    jsdocCommentAndTags
  );

  fs.outputFileSync(
    path.resolve(outputFilePath, "./functions", `${importedName}.mdx`),
    documentation
  );
}

function getSourceFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  return ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
}

async function getPackageJson(
  sourcePath: string
): Promise<{ name: string } | null> {
  const rootDir = resolve(sourcePath);
  const path = await findUp("package.json", { cwd: rootDir });
  if (!path) {
    return null;
  }

  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

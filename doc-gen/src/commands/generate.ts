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
  // TODO: I don't think either of these handle absolute file paths correctly
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

  function visit(node: ts.Node) {
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      const exportedFilePath = path.resolve(
        path.dirname(sourceFilePath),
        node.moduleSpecifier.text.replace(".js", ".ts")
      );

      node.exportClause.elements.forEach((element) => {
        if (element.name.text === importedName) {
          generateDocumentation(
            element.name.text,
            exportedFilePath,
            outputFilePath,
            packageName
          );
        }
      });
    } else if (
      // generate function definition documentation
      (ts.isFunctionDeclaration(node) && node.name?.text === importedName) ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (decl) =>
            ts.isIdentifier(decl.name) &&
            decl.name.text === importedName &&
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer))
        ))
    ) {
      const jsdocCommentAndTags = ts.getJSDocCommentsAndTags(node);
      if (jsdocCommentAndTags.length === 0) return;

      const implNode = ts.isFunctionDeclaration(node)
        ? node
        : node.declarationList.declarations.find(
            (decl) =>
              ts.isIdentifier(decl.name) &&
              decl.name.text === importedName &&
              decl.initializer &&
              (ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer))
          )!.initializer!;

      // this just gives us the right typing for implNode
      if (
        ts.isFunctionDeclaration(implNode) ||
        ts.isArrowFunction(implNode) ||
        ts.isFunctionDeclaration(implNode)
      ) {
        const documentation = functionTemplate(
          importedName,
          packageName,
          implNode,
          jsdocCommentAndTags
        );

        fs.outputFileSync(
          path.resolve(outputFilePath, "./functions", `${importedName}.mdx`),
          documentation
        );
      }
    }

    ts.forEachChild(node, (node) => visit(node));
  }

  visit(sourceFile);
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

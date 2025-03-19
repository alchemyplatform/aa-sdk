import { resolveReExport } from "eslint-plugin-eslint-rules/exports";
import { findUp } from "find-up";
import { default as fs } from "fs-extra";
import * as path from "node:path";
import { resolve } from "pathe";
import { format } from "prettier";
import ts from "typescript";
import * as logger from "../logger.js";
import { functionTemplate } from "../templates/functionTemplate.js";

export type GenerateOptions = {
  in: string;
  out: string;
};

const generatedDirectories = [
  "./functions",
  "./hooks",
  "./components",
  "./classes",
];

export async function generate(options: GenerateOptions) {
  const sourceFilePath = path.resolve(process.cwd(), options.in);
  const outputFilePath = path.resolve(process.cwd(), options.out);
  logger.info(
    `Generating documentation for ${sourceFilePath} and outputting to ${outputFilePath}`
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

  // clean the output directory to account for deleted docs
  generatedDirectories.forEach((dir) => {
    fs.emptyDirSync(path.resolve(outputFilePath, dir));
  });

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
    const exportedFilePathTs = path.resolve(
      path.dirname(sourceFilePath),
      node.moduleSpecifier.text.replace(".js", ".ts")
    );
    const exportedFilePathTsx = path.resolve(
      path.dirname(sourceFilePath),
      node.moduleSpecifier.text.replace(".js", ".tsx")
    );

    const isTsx = fs.existsSync(exportedFilePathTsx);
    const exportedFilePath = isTsx ? exportedFilePathTsx : exportedFilePathTs;

    node.exportClause.elements.forEach((element) => {
      generateDocumentation(
        element.name.text,
        exportedFilePath,
        outputFilePath,
        packageJSON.name,
        isTsx
      );
    });
  });
}

async function generateDocumentation(
  importedName: string,
  sourceFilePath: string,
  outputFilePath: string,
  packageName: string,
  isTsx: boolean
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
    generateClassDocs(node, outputFilePath, importedName, packageName);
  } else {
    generateFunctionDocs(
      node,
      importedName,
      outputFilePath,
      packageName,
      isTsx
    );
  }
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

function generateFunctionDocs(
  node: ts.VariableStatement | ts.FunctionDeclaration | ts.ClassElement,
  importedName: string,
  outputFilePath: string,
  packageName: string,
  isTsx: boolean
) {
  const documentation = functionTemplate(node, importedName, packageName);
  if (!documentation) {
    return;
  }

  // TODO: need to handle this differently in case we have `use*` methods that aren't hooks
  const outputLocation = ts.isClassElement(node)
    ? ""
    : importedName.startsWith("use")
    ? "./hooks"
    : isTsx
    ? "./components"
    : "./functions";

  const fileName = ts.isClassElement(node)
    ? node.name?.getText() ?? "constructor"
    : importedName;

  fs.outputFileSync(
    path.resolve(outputFilePath, outputLocation, `${fileName}.mdx`),
    // I have 0 clue why this needs to be formatted twice to get the correct output, but here we are...
    format(format(documentation, { parser: "mdx" }), { parser: "mdx" })
  );
}

function generateClassDocs(
  node: ts.ClassDeclaration,
  outputFilePath: string,
  importedName: string,
  packageName: string
) {
  const classOutputBasePath = path.resolve(
    outputFilePath,
    `./classes/${importedName}`
  );

  node.members.forEach((member) => {
    if (
      (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) &&
      member.modifiers?.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.PrivateKeyword ||
          modifier.kind === ts.SyntaxKind.ProtectedKeyword
      )
    ) {
      // skip properties that aren't public functions
      return;
    }

    if (
      ts.isConstructorDeclaration(member) ||
      ts.isMethodDeclaration(member) ||
      (ts.isPropertyDeclaration(member) &&
        ((member.initializer &&
          (ts.isArrowFunction(member.initializer) ||
            ts.isFunctionExpression(member.initializer))) ||
          (member.type && ts.isFunctionLike(member.type))))
    ) {
      generateFunctionDocs(
        member,
        importedName,
        classOutputBasePath,
        packageName,
        false
      );
    }
  });
}

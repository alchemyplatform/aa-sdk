import { resolveReExport } from "eslint-plugin-eslint-rules/exports";
import { findUp } from "find-up";
import { default as fs } from "fs-extra";
import * as path from "node:path";
import { resolve } from "pathe";
import { format } from "prettier";
import ts from "typescript";
import { sidebarBuilder } from "../classes/SidebarBuilder.js";
import * as logger from "../logger.js";
import { functionTemplate } from "../templates/functionTemplate.js";

export type GenerateOptions = {
  in: string | string[];
  out: string;
};

const generatedDirectories = [
  "./functions",
  "./hooks",
  "./components",
  "./classes",
];

export async function generate(options: GenerateOptions) {
  const sourceFilePaths = Array.isArray(options.in) ? options.in : [options.in];
  const outputFilePath = path.resolve(process.cwd(), options.out);
  logger.info(
    `Generating documentation for ${sourceFilePaths.length} files and outputting to ${outputFilePath}`,
  );

  // Clean the output directory to account for deleted docs
  generatedDirectories.forEach((dir) => {
    fs.emptyDirSync(path.resolve(outputFilePath, dir));
  });

  // Group files by package to handle multiple files from the same package
  const packageFiles = new Map<
    string,
    Array<{ filePath: string; sourceFile: ts.SourceFile; packageJSON: any }>
  >();

  // First pass: collect all files and group them by package
  for (const sourceFilePath of sourceFilePaths) {
    const resolvedSourceFilePath = path.resolve(process.cwd(), sourceFilePath);
    const sourceFile = getSourceFile(resolvedSourceFilePath);
    if (!sourceFile) {
      logger.error(`File not found: ${resolvedSourceFilePath}`);
      continue;
    }

    const packageJSON = await getPackageJson(resolvedSourceFilePath);
    if (!packageJSON) {
      logger.error(`Could not find package.json for ${resolvedSourceFilePath}`);
      continue;
    }

    if (!packageFiles.has(packageJSON.name)) {
      packageFiles.set(packageJSON.name, []);
    }
    packageFiles.get(packageJSON.name)!.push({
      filePath: resolvedSourceFilePath,
      sourceFile,
      packageJSON,
    });
  }

  // Second pass: process each package with all its files
  for (const [packageName, files] of packageFiles) {
    logger.info(
      `Processing package: ${packageName} with ${files.length} file(s)`,
    );

    // Initialize sidebar builder for this package
    sidebarBuilder.clear();
    sidebarBuilder.setPackageName(packageName);

    // Process all files for this package
    for (const { filePath, sourceFile } of files) {
      logger.info(`  Processing file: ${filePath}`);

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
          path.dirname(filePath),
          node.moduleSpecifier.text.replace(".js", ".ts"),
        );
        const exportedFilePathTsx = path.resolve(
          path.dirname(filePath),
          node.moduleSpecifier.text.replace(".js", ".tsx"),
        );

        const isTsx = fs.existsSync(exportedFilePathTsx);
        const exportedFilePath = isTsx
          ? exportedFilePathTsx
          : exportedFilePathTs;

        node.exportClause.elements.forEach((element) => {
          generateDocumentation(
            element.name.text,
            exportedFilePath,
            outputFilePath,
            packageName,
            isTsx,
          );
        });
      });
    }

    // Generate and update the docs.yml file for this package (only once per package)
    try {
      await sidebarBuilder.updateDocsYaml();
      logger.info(`Successfully updated docs.yml for package: ${packageName}`);
    } catch (error) {
      logger.error(
        `Failed to update docs.yml for package ${packageName}:`,
        error,
      );
    }
  }

  if (packageFiles.size > 0) {
    logger.info(
      `Completed processing ${packageFiles.size} packages:`,
      Array.from(packageFiles.keys()).join(", "),
    );
  } else {
    logger.warn("No packages were successfully processed");
  }
}

async function generateDocumentation(
  importedName: string,
  sourceFilePath: string,
  outputFilePath: string,
  packageName: string,
  isTsx: boolean,
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
    sidebarBuilder.addEntry(node, outputFilePath, importedName, isTsx);
    generateFunctionDocs(
      node,
      importedName,
      outputFilePath,
      packageName,
      isTsx,
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
    true,
  );
}

async function getPackageJson(
  sourcePath: string,
): Promise<{ name: string } | null> {
  const rootDir = resolve(sourcePath);
  const path = await findUp("package.json", { cwd: rootDir });
  if (!path) {
    return null;
  }

  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

async function generateFunctionDocs(
  node: ts.VariableStatement | ts.FunctionDeclaration | ts.ClassElement,
  importedName: string,
  outputFilePath: string,
  packageName: string,
  isTsx: boolean,
) {
  // TODO: need to handle this differently in case we have `use*` methods that aren't hooks
  const outputLocation = ts.isClassElement(node)
    ? ""
    : importedName.startsWith("use")
      ? "/hooks"
      : isTsx
        ? "/components"
        : "/functions";

  const fileName = ts.isClassElement(node)
    ? (node.name?.getText() ?? "constructor")
    : importedName;

  const outputPath = `${outputFilePath}${outputLocation}/${fileName}`;

  const documentation = functionTemplate(
    node,
    importedName,
    packageName,
    outputPath,
  );
  if (!documentation) {
    return;
  }

  fs.outputFileSync(
    path.resolve(`${outputPath}.mdx`),
    await format(await format(documentation, { parser: "mdx" }), {
      parser: "mdx",
    }),
  );
}

function generateClassDocs(
  node: ts.ClassDeclaration,
  outputFilePath: string,
  importedName: string,
  packageName: string,
) {
  const classOutputBasePath = path.resolve(
    outputFilePath,
    `./classes/${importedName}`,
  );

  node.members.forEach((member) => {
    if (
      (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) &&
      member.modifiers?.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.PrivateKeyword ||
          modifier.kind === ts.SyntaxKind.ProtectedKeyword,
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
      sidebarBuilder.addEntry(member, classOutputBasePath, importedName, false);

      generateFunctionDocs(
        member,
        importedName,
        classOutputBasePath,
        packageName,
        false,
      );
    }
  });
}

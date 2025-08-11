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

function isValidExportDeclaration(
  node: ts.Node,
): node is ts.ExportDeclaration & {
  moduleSpecifier: ts.StringLiteral;
  exportClause: ts.NamedExports;
} {
  return (
    ts.isExportDeclaration(node) &&
    !!node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    !!(node.exportClause && ts.isNamedExports(node.exportClause))
  );
}

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
    Array<{ filePath: string; sourceFile: ts.SourceFile }>
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

      const documentationPromises: Promise<void>[] = [];

      sourceFile.forEachChild((node) => {
        // for now we only process re-exports
        if (!isValidExportDeclaration(node)) {
          return;
        }
        const exportedFilePathTs = path.resolve(
          path.dirname(filePath),
          node.moduleSpecifier.text.replace(/\.js$/, ".ts"),
        );
        const exportedFilePathTsx = path.resolve(
          path.dirname(filePath),
          node.moduleSpecifier.text.replace(/\.js$/, ".tsx"),
        );

        const isTsx = fs.existsSync(exportedFilePathTsx);
        const exportedFilePath = isTsx
          ? exportedFilePathTsx
          : exportedFilePathTs;

        for (const element of node.exportClause.elements) {
          documentationPromises.push(
            generateDocumentation(
              element.name.text,
              exportedFilePath,
              outputFilePath,
              isTsx,
            ),
          );
        }
      });

      // Wait for all documentation generation to complete
      await Promise.all(documentationPromises);
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

  // Get the package.json to determine the export path
  const packageJSON = await getPackageJson(sourceFilePath);
  if (!packageJSON) {
    return;
  }

  const exportPath = await getExportPathForFunction(
    importedName,
    sourceFilePath,
    packageJSON,
  );

  if (ts.isClassDeclaration(node)) {
    generateClassDocs(node, outputFilePath, importedName, exportPath);
  } else {
    // Use the resolved node directly - it should already be the correct node with JSDoc comments
    sidebarBuilder.addEntry(node, outputFilePath, importedName, isTsx);
    generateFunctionDocs(node, importedName, outputFilePath, isTsx, exportPath);
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
): Promise<{ name: string; exports?: Record<string, any> } | null> {
  const rootDir = resolve(sourcePath);
  const path = await findUp("package.json", { cwd: rootDir });
  if (!path) {
    return null;
  }

  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

async function getExportPathForFunction(
  functionName: string,
  sourceFilePath: string,
  packageJson: { name: string; exports?: Record<string, any> },
): Promise<string> {
  if (!packageJson.exports) {
    return packageJson.name;
  }

  // Get the package root directory
  const packageRoot = path.dirname(
    (await findUp("package.json", { cwd: sourceFilePath })) || "",
  );
  if (!packageRoot) {
    return packageJson.name;
  }

  // First, check if the function is exported from the root export (".")
  // This is the preferred export path
  const rootExport = packageJson.exports["."];
  if (rootExport) {
    const rootImportPath = rootExport.import || rootExport.default;
    if (rootImportPath) {
      // Check if the function is exported from the root export
      // by examining the main index file
      const mainIndexPath = path.resolve(
        packageRoot,
        rootImportPath
          .replace(/^\.\/dist\/esm\//, "src/")
          .replace(/\.js$/, ".ts"),
      );

      if (fs.existsSync(mainIndexPath)) {
        const mainIndexSource = getSourceFile(mainIndexPath);
        if (
          mainIndexSource &&
          isFunctionExportedFromFile(functionName, mainIndexSource)
        ) {
          return packageJson.name; // Prefer root export
        }
      }
    }
  }

  // If not found in root export, look for named exports
  for (const [exportPath, exportConfig] of Object.entries(
    packageJson.exports,
  )) {
    if (exportPath === ".") continue; // Skip the main export (already checked)

    // Get the export import path
    const exportImportPath = exportConfig.import || exportConfig.default;
    if (!exportImportPath) continue;

    // Check if the function is exported from this named export
    const namedExportPath = path.resolve(
      packageRoot,
      exportImportPath
        .replace(/^\.\/dist\/esm\//, "src/")
        .replace(/\.js$/, ".ts"),
    );

    if (fs.existsSync(namedExportPath)) {
      const namedExportSource = getSourceFile(namedExportPath);
      if (
        namedExportSource &&
        isFunctionExportedFromFile(functionName, namedExportSource)
      ) {
        return `${packageJson.name}${exportPath.replace(/^\./, "")}`;
      }
    }
  }

  // If no match found, return the main package name
  return packageJson.name;
}

function isFunctionExportedFromFile(
  functionName: string,
  sourceFile: ts.SourceFile,
): boolean {
  let found = false;

  function visit(node: ts.Node) {
    if (found) return;

    if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      // Check if this export declaration exports our function
      for (const element of node.exportClause.elements) {
        if (element.name.text === functionName) {
          found = true;
          return;
        }
      }
    }

    if (!found) {
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return found;
}

async function generateFunctionDocs(
  node: ts.VariableStatement | ts.FunctionDeclaration | ts.ClassElement,
  importedName: string,
  outputFilePath: string,
  isTsx: boolean,
  exportPath: string,
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
    outputPath,
    exportPath,
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
  exportPath: string,
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
        false,
        exportPath,
      );
    }
  });
}

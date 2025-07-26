import { getJSDocComment } from "@es-joy/jsdoccomment";
import { type Rule } from "eslint";
import ESTree from "estree";
import findUp from "find-up";
import fs from "fs-extra";
import * as path from "path";
import ts from "typescript";
import { reExportFixerEslint } from "../fixers/re-export-fixer.js";
import { resolveReExport } from "../resolveReExport.js";
import { getExportedFilePath } from "../utils.js";

type Export = {
  importedName: string;
  exportedFrom: string;
};
const packageNameToExports = new Map<string, Map<string, Export>>();

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require JSDoc comments on re-exported entities from other modules",
      category: "Best Practices",
      recommended: false,
    },
    messages: {
      missingJsdoc:
        'Publicly exported member "{{name}}" must have a JSDoc comment.',
    },
    hasSuggestions: true,
    fixable: "code", // This rule is fixable
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            description: "List of files to exclude from the rule",
            type: "array",
            items: {
              type: "string",
            },
            default: [],
          },
          fixBatchSize: {
            description:
              "Maximum number of fixes to apply in a single run of the rule (0 for unlimited)",
            type: "number",
            default: 10,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const enableFixer: boolean =
      process.argv.some((arg) => arg.includes("eslint")) &&
      process.argv.some((x) => x === "--fix" || x === "-f");
    const fixBatchSize: number = context.options[0]?.fixBatchSize;
    // const ignore: string[] = context.options[0]?.ignore || [];

    const packageJsonPath = findUp.sync("package.json", {
      cwd: path.dirname(context.filename),
    });
    if (!packageJsonPath) {
      throw new Error("Could not find package.json");
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const packageName = packageJson.name;
    populateExports(packageJsonPath, packageName);

    function hasJsDocCommentEslint(node: Rule.Node): boolean {
      const comment = getJSDocComment(context.sourceCode, node, {
        maxLines: Infinity,
        minLines: 0,
      });
      return !!comment;
    }

    function checkArrowFunctionOrFunctionExpression(
      node: (ESTree.FunctionExpression | ESTree.ArrowFunctionExpression) &
        Rule.NodeParentExtension,
    ) {
      if (
        node.parent.type === "VariableDeclarator" &&
        node.parent.id.type === "Identifier"
      ) {
        checkNode(node, node.parent.id.name);
      } else if (
        (node.parent.type === "MethodDefinition" ||
          node.parent.type === "PropertyDefinition") &&
        node.parent.key.type === "Identifier" &&
        // @ts-expect-error according to the AST explorer this should be a thing
        (node.parent.accessibility == null ||
          // @ts-expect-error according to the AST explorer this should be a thing
          node.parent.accessibility === "public")
      ) {
        // for class methods we want to check the class name is registered
        const className = (() => {
          let parent: Rule.Node & Rule.NodeParentExtension = node.parent;
          while (parent) {
            if (parent.type === "ClassDeclaration") {
              return parent.id.name;
            }
            parent = parent.parent;
          }
          return null;
        })();
        if (!className) return;

        checkNode(node, className, node.parent.key.name);
      }
    }

    // name override is just used for context
    function checkNode(node: Rule.Node, name: string, nameOverride?: string) {
      const exportEntry = packageNameToExports.get(packageName)?.get(name);
      if (!exportEntry) {
        return;
      }

      if (exportEntry.exportedFrom !== context.filename) {
        // skip export from wrong file
        return;
      }

      if (!hasJsDocCommentEslint(node)) {
        context.report({
          node,
          messageId: "missingJsdoc",
          data: { name: nameOverride ?? name },
          suggest: [
            {
              desc: "Add JSDoc comment",
              data: { name: nameOverride ?? name },
              fix: (fixer) => reExportFixerEslint(fixer, node, fixBatchSize),
            },
          ],
          fix: enableFixer
            ? (fixer) => reExportFixerEslint(fixer, node, fixBatchSize)
            : undefined,
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        checkNode(node, node.id.name);
      },
      ClassDeclaration(node) {
        checkNode(node, node.id.name);
      },
      FunctionExpression(node) {
        checkArrowFunctionOrFunctionExpression(node);
      },
      ArrowFunctionExpression(node) {
        checkArrowFunctionOrFunctionExpression(node);
      },
    };
  },
};

function populateExports(packageJsonPath: string, packageName: string) {
  if (packageNameToExports.has(packageName)) {
    return;
  }

  const exportsMap = new Map<string, Export>();
  packageNameToExports.set(packageName, exportsMap);
  const indexPath = path.resolve(
    path.dirname(packageJsonPath),
    "./src/index.ts",
  );

  if (!fs.existsSync(indexPath)) {
    return;
  }

  const fileContent = fs.readFileSync(indexPath, "utf-8");
  const sourceFile = ts.createSourceFile(
    indexPath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );

  sourceFile.forEachChild((node) => {
    if (
      !ts.isExportDeclaration(node) ||
      !node.moduleSpecifier ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      !(node.exportClause && ts.isNamedExports(node.exportClause))
    ) {
      return;
    }

    node.exportClause.elements.forEach((element) => {
      const exportedNode = resolveReExport(indexPath, element.name.text);
      if (!exportedNode) return;

      if (ts.isClassDeclaration(exportedNode)) {
        // note: this already registers the class in the exports map
        return registerClassMembers(exportedNode, exportsMap);
      }

      const exportedFrom = getExportedFilePath(
        indexPath,
        exportedNode.getSourceFile().fileName,
      );
      if (!exportedFrom) {
        return;
      }

      exportsMap.set(element.name.text, {
        importedName: element.name.text,
        exportedFrom,
      });
    });
  });
}

function getImportOf(node: ts.Node) {
  const sourceFile = node.getSourceFile();
  const nodeName = ts.isExpressionWithTypeArguments(node)
    ? node.expression.getText()
    : node.getText();

  let result: string | undefined;
  sourceFile.forEachChild((node_) => {
    if (ts.isImportDeclaration(node_)) {
      const importClause = node_.importClause;
      const moduleSpecifier = node_.moduleSpecifier
        .getText()
        .replace(/['"]/g, "");

      if (importClause && importClause.namedBindings) {
        const namedBindings = importClause.namedBindings;
        if (ts.isNamedImports(namedBindings)) {
          namedBindings.elements.forEach((element) => {
            if (element.name.getText() === nodeName) {
              result = moduleSpecifier;
            }
          });
        }
      }
    }

    return result != null;
  });

  return result ?? sourceFile.fileName;
}

function registerClassMembers(
  node: ts.Node | null,
  exportsMap: Map<string, Export>,
) {
  if (!node || !ts.isClassDeclaration(node)) {
    return;
  }
  const sourceFile = node.getSourceFile();

  if (node.name?.getText() === "AlchemyWebSigner") {
  }

  // handle super classes
  for (const heritageClause of node.heritageClauses ?? []) {
    if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
      const superClass = heritageClause.types[0];
      if (superClass && ts.isExpressionWithTypeArguments(superClass)) {
        const superClassName = superClass.expression.getText();
        const superClassLocation = getImportOf(superClass);
        const exportedFrom = getExportedFilePath(
          sourceFile.fileName,
          superClassLocation,
        );
        if (!exportedFrom) {
          return;
        }

        const superClassNode = resolveReExport(exportedFrom, superClassName);

        registerClassMembers(superClassNode, exportsMap);
      }
    }
  }

  exportsMap.set(node.name!.getText(), {
    importedName: node.name!.getText(),
    exportedFrom: sourceFile.fileName,
  });
}

export default rule;

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
        Rule.NodeParentExtension
    ) {
      if (
        node.parent.type === "VariableDeclarator" &&
        node.parent.id.type === "Identifier"
      ) {
        checkNode(node, node.parent.id.name);
      } else if (
        (node.parent.type === "MethodDefinition" ||
          node.parent.type === "PropertyDefinition") &&
        node.parent.key.type === "Identifier"
      ) {
        const className = (() => {
          let parent: Rule.Node & Rule.NodeParentExtension = node.parent;
          while (parent && parent.type !== "ClassDeclaration") {
            parent = parent.parent;
          }

          return parent.id?.name;
        })();

        checkNode(node, `${className}.${node.parent.key.name}`);
      }
    }

    function checkNode(node: Rule.Node, name: string) {
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
          data: { name },
          suggest: [
            {
              desc: "Add JSDoc comment",
              data: { name },
              fix: (fixer) =>
                reExportFixerEslint(fixer, node, context, fixBatchSize),
            },
          ],
          fix: enableFixer
            ? (fixer) => reExportFixerEslint(fixer, node, context, fixBatchSize)
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
    "./src/index.ts"
  );

  if (!fs.existsSync(indexPath)) {
    return;
  }

  const fileContent = fs.readFileSync(indexPath, "utf-8");
  const sourceFile = ts.createSourceFile(
    indexPath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
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

      // TODO: for class declarations, we need to add all of the methods to the exports map
      if (ts.isClassDeclaration(exportedNode)) {
        registerClassMembers(exportedNode, exportsMap);
      }

      const exportedFrom = getExportedFilePath(
        indexPath,
        exportedNode.getSourceFile().fileName
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
  exportsMap: Map<string, Export>
) {
  if (!node || !ts.isClassDeclaration(node)) {
    return;
  }
  const sourceFile = node.getSourceFile();

  // handle super classes
  for (const heritageClause of node.heritageClauses ?? []) {
    if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
      const superClass = heritageClause.types[0];
      if (superClass && ts.isExpressionWithTypeArguments(superClass)) {
        const superClassName = superClass.expression.getText();
        const superClassLocation = getImportOf(superClass);
        const superClassNode = resolveReExport(
          superClassLocation,
          superClassName
        );
        const exportedFrom = getExportedFilePath(
          sourceFile.fileName,
          superClassLocation
        );

        if (exportedFrom) {
          registerClassMembers(superClassNode, exportsMap);
          exportsMap.set(superClassName, {
            importedName: superClassName,
            exportedFrom,
          });
        }
      }
    }
  }

  const className = node.name?.getText();
  function getMethodNameKey(methodName: string) {
    return `${className}.${methodName}`;
  }

  node.members.forEach((member) => {
    if (ts.isMethodDeclaration(member) && !isPrivateOrProtectedMember(member)) {
      const key = getMethodNameKey(member.name.getText());
      exportsMap.set(key, {
        importedName: key,
        exportedFrom: sourceFile.fileName,
      });
    } else if (ts.isConstructorDeclaration(member)) {
      const key = getMethodNameKey("constructor");
      exportsMap.set(key, {
        importedName: key,
        exportedFrom: sourceFile.fileName,
      });
    } else if (
      ts.isPropertyDeclaration(member) &&
      (member.initializer?.kind === ts.SyntaxKind.ArrowFunction ||
        member.initializer?.kind === ts.SyntaxKind.FunctionExpression) &&
      !isPrivateOrProtectedMember(member)
    ) {
      const key = getMethodNameKey(member.name.getText());
      exportsMap.set(key, {
        importedName: key,
        exportedFrom: sourceFile.fileName,
      });
    }
  });
}

function isPrivateOrProtectedMember(
  node: ts.PropertyDeclaration | ts.MethodDeclaration
) {
  return node.modifiers?.some(
    (x) =>
      x.kind === ts.SyntaxKind.PrivateKeyword ||
      x.kind === ts.SyntaxKind.ProtectedKeyword
  );
}

export default rule;

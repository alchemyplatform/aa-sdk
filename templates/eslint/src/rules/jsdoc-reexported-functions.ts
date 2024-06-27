import { getJSDocComment } from "@es-joy/jsdoccomment";
import { type Rule } from "eslint";
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
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const enableFixer: boolean =
      process.argv.some((arg) => arg.includes("eslint")) &&
      process.argv.some((x) => x === "--fix" || x === "-f");
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
              fix: (fixer) => reExportFixerEslint(fixer, node, context),
            },
          ],
          fix: enableFixer
            ? (fixer) => reExportFixerEslint(fixer, node, context)
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
        if (
          node.parent.type === "VariableDeclarator" &&
          node.parent.id.type === "Identifier" &&
          packageNameToExports.get(packageName)?.has(node.parent.id.name)
        ) {
          checkNode(node, node.parent.id.name);
        }
      },
      ArrowFunctionExpression(node) {
        if (
          node.parent.type === "VariableDeclarator" &&
          node.parent.id.type === "Identifier" &&
          packageNameToExports.get(packageName)?.has(node.parent.id.name)
        ) {
          checkNode(node, node.parent.id.name);
        }
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

      const exportedFrom = getExportedFilePath(
        indexPath,
        exportedNode.getSourceFile().fileName
      );

      exportsMap.set(element.name.text, {
        importedName: element.name.text,
        exportedFrom,
      });
    });
  });
}

export default rule;

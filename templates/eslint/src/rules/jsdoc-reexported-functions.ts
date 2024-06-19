import { type Rule } from "eslint";
import { minimatch } from "minimatch";
import * as path from "path";
import ts from "typescript";
import { reExportFixer } from "../fixers/re-export-fixer.js";
import { resolveReExport } from "../resolveReExport.js";

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
        'Re-exported entity "{{name}}" from another module must have a JSDoc comment.',
    },
    fixable: "code", // This rule is fixable
    schema: [
      {
        type: "object",
        properties: {
          enableFixer: {
            type: "boolean",
            default: false,
          },
          fixBatchSize: {
            description:
              "If fixing is enabled, the number of files to fix at once (0 for all, default 10)",
            type: "number",
            default: 10,
          },
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
    const enableFixer: boolean = context.options[0]?.enableFixer || false;
    const fixBatchSize: number = context.options[0]?.fixBatchSize ?? 10;
    const ignore: string[] = context.options[0]?.ignore || [];

    function hasJsDocComment(node: ts.Node): boolean {
      const jsdocComment = ts.getJSDocCommentsAndTags(node).length > 0;
      return jsdocComment;
    }

    function checkSourceFile(filePath: string, importedName: string): boolean {
      const node = resolveReExport(filePath, importedName);
      // if we don't find the node, return true because if might not be part of the filters
      return node ? hasJsDocComment(node) : true;
    }

    return {
      ExportNamedDeclaration(node) {
        if (!context.filename.endsWith("src/index.ts")) {
          // skip non root files
          return;
        }

        if (ignore.some((pattern) => minimatch(context.filename, pattern))) {
          return;
        }

        if (node.source) {
          // This is a re-export from another module, e.g., export { something } from 'somewhere';
          const sourceFilePath = path.resolve(
            path.dirname(context.filename),
            (node.source.value as string).replace(".js", ".ts")
          );

          node.specifiers.forEach((specifier) => {
            const importedName = specifier.local.name;

            if (!checkSourceFile(sourceFilePath, importedName)) {
              context.report({
                node: specifier,
                messageId: "missingJsdoc",
                data: { name: importedName },
                fix: enableFixer
                  ? reExportFixer(sourceFilePath, importedName, fixBatchSize)
                  : undefined,
              });
            }
          });
        }
      },
    };
  },
};

export default rule;

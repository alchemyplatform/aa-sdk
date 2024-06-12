import { type Rule } from "eslint";
import * as fs from "fs";
import * as path from "path";
import ts from "typescript";

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
    schema: [], // no options
  },
  create(context) {
    function hasJsDocComment(node: ts.Node): boolean {
      const jsdocComment = ts.getJSDocCommentsAndTags(node).length > 0;
      return jsdocComment;
    }

    function resolveReExport(
      filePath: string,
      importedName: string
    ): ts.Node | null {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      let resolvedNode: ts.Node | null = null;

      function visit(node: ts.Node) {
        if (
          ts.isExportDeclaration(node) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          const exportedFilePath = path.resolve(
            path.dirname(filePath),
            node.moduleSpecifier.text.replace(".js", ".ts")
          );

          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            node.exportClause.elements.forEach((element) => {
              if (element.name.text === importedName) {
                resolvedNode = resolveReExport(
                  exportedFilePath,
                  element.propertyName?.text || element.name.text
                );
              }
            });
          }
        } else if (
          (ts.isFunctionDeclaration(node) &&
            node.name?.text === importedName) ||
          (ts.isClassDeclaration(node) &&
            node.name?.escapedText === importedName) ||
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
          resolvedNode = node;
        }

        if (resolvedNode) return;

        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
      return resolvedNode;
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
              });
            }
          });
        }
      },
    };
  },
};

export default rule;

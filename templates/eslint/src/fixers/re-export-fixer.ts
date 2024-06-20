import { builders } from "ast-types";
import "dotenv/config";
import fs from "node:fs";
import * as recast from "recast";
import { createSyncFn } from "synckit";
import type ts from "typescript";
import { resolveReExport } from "../resolveReExport.js";

let fixedInBatch = 0;

export function reExportFixer(
  sourceFilePath: string,
  importedName: string,
  fixBatchSize: number
) {
  return () => {
    if (fixBatchSize > 0 && fixedInBatch === fixBatchSize) return null;

    const node = resolveReExport(sourceFilePath, importedName);
    if (!node) return null;

    const sourceFile = node.getSourceFile();
    const ast = recast.parse(sourceFile.getFullText(), {
      parser: require("recast/parsers/typescript"),
    });

    recast.visit(ast, {
      visitExportNamedDeclaration(path) {
        const pathNode = path.node;
        if (
          (pathNode.declaration?.type === "VariableDeclaration" &&
            pathNode.declaration.declarations.some(
              (decl) =>
                decl.type === "VariableDeclarator" &&
                decl.init?.type === "ArrowFunctionExpression" &&
                decl.id.type === "Identifier" &&
                decl.id.name === importedName
            )) ||
          (pathNode.declaration?.type === "FunctionDeclaration" &&
            pathNode.declaration.id?.name === importedName)
        ) {
          const jsdocComment = createJsDocComment(node);
          const comment = builders.commentBlock(
            `*\n ${jsdocComment.replace("/**", "").replace("*/", "").trim()}\n`,
            true,
            false
          );

          // the comment block is not properly formatted by recast, it needs a whitespace after the closing block
          comment.value = comment.value.replace("*/", " */");

          if (!pathNode.comments) pathNode.comments = [];
          pathNode.comments.unshift(comment);
        }

        this.traverse(path);
      },
    });

    fs.writeFileSync(
      sourceFile.fileName,
      recast.print(ast, { reuseWhitespace: true }).code,
      "utf-8"
    );

    fixedInBatch++;

    return null;
  };
}

const getCommentSync = createSyncFn(require.resolve("./openai-worker.js")) as (
  code: string
) => string;

function createJsDocComment(node: ts.Node) {
  const commentText = getCommentSync(node.getFullText());

  return commentText;
}

import "dotenv/config";
import type { Rule } from "eslint";
import { createSyncFn } from "synckit";

export function reExportFixerEslint(
  fixer: Rule.RuleFixer,
  node: Rule.Node,
  context: Rule.RuleContext
) {
  const commentBody = getCommentSync(context.sourceCode.getText(node));

  let parent = node.parent;
  // TODO: this is not right for Method and Property definitions in classes
  while (parent && parent.type !== "ExportNamedDeclaration") {
    parent = parent.parent;
  }
  if (!parent) {
    return null;
  }

  return fixer.insertTextBefore(parent, commentBody);
}

const getCommentSync = createSyncFn(require.resolve("./openai-worker.js")) as (
  code: string
) => string;

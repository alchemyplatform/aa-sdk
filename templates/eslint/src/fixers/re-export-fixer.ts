import "dotenv/config";
import type { Rule } from "eslint";
import { createSyncFn } from "synckit";

let numFixes = 0;

export function reExportFixerEslint(
  fixer: Rule.RuleFixer,
  node: Rule.Node,
  context: Rule.RuleContext,
  fixBatchSize = 10,
) {
  if (process.env.OPENAI_API_KEY == null) {
    console.warn(
      "OPENAI_API_KEY is not set, skipping re-export fixer. Set OPENAI_API_KEY to enable this feature.",
    );
    return null;
  }

  if (fixBatchSize > 0 && numFixes > fixBatchSize) {
    // TODO: add this back to the configuration
    return null;
  }

  let parent = node.parent;
  // TODO: this is not right for Method and Property definitions in classes
  while (
    parent &&
    !(
      parent.type === "ExportNamedDeclaration" ||
      node.parent.type === "MethodDefinition" ||
      node.parent.type === "PropertyDefinition"
    )
  ) {
    parent = parent.parent;
  }
  if (!parent) {
    return null;
  }

  numFixes++;
  const commentBody = getCommentSync(context.sourceCode.getText(node));

  return fixer.insertTextBefore(parent, commentBody);
}

const getCommentSync = createSyncFn(require.resolve("./openai-worker.js")) as (
  code: string,
) => string;

import type { Rule } from "eslint";

let numFixes = 0;

export function reExportFixerEslint(
  fixer: Rule.RuleFixer,
  node: Rule.Node,
  fixBatchSize = 10,
) {
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
  const commentBody = "/** TODO: Add documentation */\n";

  return fixer.insertTextBefore(parent, commentBody);
}

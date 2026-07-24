import { generate } from "./generate.js";
import { snapshot } from "./snapshot.js";

/**
 * CLI entrypoint.
 *
 *   tsx src/cli.ts snapshot [--docs <dir>] [--allow-dirty]
 *   tsx src/cli.ts --target <name>
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args[0] === "snapshot") {
    const docsFlag = args.indexOf("--docs");
    await snapshot({
      docsDir: docsFlag !== -1 ? args[docsFlag + 1] : undefined,
      allowDirty: args.includes("--allow-dirty"),
    });
    return;
  }

  const targetFlag = args.indexOf("--target");
  if (targetFlag !== -1 && args[targetFlag + 1]) {
    await generate(args[targetFlag + 1]);
    return;
  }

  console.error(
    "Usage: cli.ts snapshot [--docs <dir>] [--allow-dirty] | cli.ts --target <name>",
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

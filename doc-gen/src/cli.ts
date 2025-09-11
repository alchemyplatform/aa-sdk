#!/usr/bin/env node
import { cac } from "cac";
import { generate, type GenerateOptions } from "./commands/generate.js";
import * as logger from "./logger.js";
import { VERSION } from "./version.js";

const cli = cac("ak-docgen");

cli
  .command("generate", "Generate documentation")
  .option(
    "--in <path>",
    "[string] path to source file containing public exports (can specify multiple times for multiple files)",
  )
  .option("--out <path>", "[string] path to output directory")
  .example(
    (name) =>
      `${name} generate --in src/index.ts --in src/components.ts --out docs`,
  )
  .example((name) => `${name} generate --in src/index.ts --out docs`)
  .action(async (options: GenerateOptions) => {
    // Ensure options.in is always an array
    const inputPaths = Array.isArray(options.in) ? options.in : [options.in];
    generate({ ...options, in: inputPaths });
  });

cli.help();
cli.version(VERSION);

void (async () => {
  try {
    // Parse CLI args without running command
    cli.parse(process.argv, { run: false });
    if (!cli.matchedCommand) {
      if (cli.args.length === 0) {
        if (!cli.options.help && !cli.options.version) cli.outputHelp();
      } else throw new Error(`Unknown command: ${cli.args.join(" ")}`);
    }
    await cli.runMatchedCommand();
  } catch (error) {
    logger.error(`\n${(error as Error).message}`);
    process.exit(1);
  }
})();

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
    "[string] path to source file containing public exports",
  )
  .option("--out <path>", "[string] path to output directory")
  .option("--fern", "[boolean] generate Fern documentation")
  .example((name) => `${name} generate --in src/index.ts --out docs`)
  .action(async (options: GenerateOptions) => generate(options));

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

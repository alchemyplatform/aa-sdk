#!/usr/bin/env node
import { cac } from "cac";
import { generate, type GenerateOptions } from "./commands/generate/index.js";
import { init, type InitOptions } from "./commands/init.js";
import {
  buildUserOperation,
  sendUserOperation,
  signUserOperation,
  type UserOpOptions,
} from "./commands/userop/index.js";
import * as logger from "./logger.js";
import { VERSION } from "./version.js";

const cli = cac("plugingen");

cli
  .command("init", "Initialize a new plugingen config")
  .option("-c, --config <path>", "[string] path to config file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} init`)
  .action(async (options: InitOptions) => init(options));

cli
  .command(
    "generate",
    "Generate code for all of the plugins configured within the plugingen config"
  )
  .option("-c, --config <path>", "[string] path to config file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} generate`)
  .action(async (options: GenerateOptions) => generate(options));

cli
  .command("build-uo", "build a user operation using smart account client")
  .option("-c, --config <path>", "[string] path to config json file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} build-uo`)
  .action(async (options: UserOpOptions) => buildUserOperation(options));

cli
  .command(
    "sign-uo",
    "build and return a signed user operation using smart account client"
  )
  .option("-c, --config <path>", "[string] path to config json file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} sign-uo`)
  .action(async (options: UserOpOptions) => signUserOperation(options));

cli
  .command(
    "send-uo",
    "build, sign, and send a user operation using smart account client"
  )
  .option("-c, --config <path>", "[string] path to config json file")
  .option("-r, --root <path>", "[string] root path to resolve config from")
  .example((name) => `${name} send-uo`)
  .action(async (options: UserOpOptions) => sendUserOperation(options));

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

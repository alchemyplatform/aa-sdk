#!/usr/bin/env node
import { program } from "commander";
import { addPackage } from "./commands/add-package/command.js";

program
  .command("add-package")
  .option("-p, --package <package>", "The package to add")
  .option("-d, --description <description>", "The description of the package")
  .action((options) => addPackage(options));

await program.parseAsync();

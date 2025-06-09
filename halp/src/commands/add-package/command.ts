import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { Listr } from "listr2";
import { dirname, join } from "path";
import { format } from "prettier";
import { injectVersionTemplate } from "./base/injectVersionTemplate.js";
import { packageJsonTemplate } from "./base/packageJsonTemplate.js";
import { tsconfigBuildTemplate } from "./base/tsconfigBuildTemplate.js";
import { tsconfigTemplate } from "./base/tsconfigTemplate.js";
import { vitestConfigTemplate } from "./base/vitestConfigTemplate.js";
import { jsonRpcTask } from "./json-rpc/task.js";

export type AddPackageOptions = {
  package: string;
  description: string;
  type: "basic" | "rest-api" | "json-rpc";
};

export async function addPackage(options: Record<string, any>) {
  console.log(chalk.blue("🚀 Creating a new package..."));

  const config = await gatherConfig(options);
  const monorepoRoot = await findMonorepoRoot();
  const packagesFolder = join(monorepoRoot, "packages");
  if (!existsSync(packagesFolder)) {
    console.log(chalk.yellow("Could not find packages folder! Exiting early"));
    return;
  }

  const packageFolderName = config.package.startsWith("@alchemy")
    ? config.package.replace("@alchemy/", "")
    : config.package;

  const packageFolder = join(packagesFolder, packageFolderName);

  const tasks = new Listr([
    {
      title: "Creating package structure",
      task: async (_, task) => {
        task.output = "Creating package folder";
        if (!existsSync(packageFolder)) {
          await mkdir(packageFolder);
        }

        task.output = "Creating src folder";
        await mkdir(join(packageFolder, "src"));

        task.output = "Creating index.ts";
        await writeFile(join(packageFolder, "src", "index.ts"), "");
      },
    },
    {
      title: "Creating package.json",
      task: async () => {
        const packageJson = packageJsonTemplate(
          packageFolderName,
          config.description,
        );

        await writeFile(
          join(packageFolder, "package.json"),
          await format(JSON.stringify(packageJson, null, 2), {
            parser: "json",
          }),
        );
      },
    },
    {
      title: "Creating tsconfig.json",
      task: async () => {
        await writeFile(
          join(packageFolder, "tsconfig.json"),
          await format(JSON.stringify(tsconfigTemplate(), null, 2), {
            parser: "json",
          }),
        );
      },
    },
    {
      title: "Creating tsconfig.build.json",
      task: async () => {
        await writeFile(
          join(packageFolder, "tsconfig.build.json"),
          await format(JSON.stringify(tsconfigBuildTemplate(), null, 2), {
            parser: "json",
          }),
        );
      },
    },
    {
      title: "Creating vitest.config.ts",
      task: async () => {
        await writeFile(
          join(packageFolder, "vitest.config.ts"),
          await format(vitestConfigTemplate(packageFolderName), {
            parser: "typescript",
          }),
        );
      },
    },
    {
      title: "Creating inject-version.ts",
      task: async () => {
        await writeFile(
          join(packageFolder, "inject-version.ts"),
          await format(injectVersionTemplate(), {
            parser: "typescript",
          }),
        );
      },
    },
    jsonRpcTask(config, packageFolder),
    {
      title: "Adding REST API Scaffolding",
      enabled: () => config.type === "rest-api",
      task: async (_, task) => {
        task.skip(
          "not implemented yet, need to implement alchemy transport REST support first",
        );
        // TODO: this should probably use subtasks
        // task.newListr([]);
      },
    },
  ]);

  await tasks.run();
}

async function gatherConfig(
  options: Record<string, any>,
): Promise<AddPackageOptions> {
  const packageName =
    options.package ??
    (await input({ message: "What is the name of the package?" }));
  const description =
    options.description ??
    (await input({ message: "What is the description of the package?" }));

  const type = await select({
    message: "What type of package is this?",
    choices: [
      {
        name: "Basic",
        description: "A basic package with minimal scaffolding",
        value: "basic" as const,
      },
      {
        name: "JSON-RPC",
        description:
          "A package that provides interfaces for interacting with Alchemy JSON-RPC APIs",
        value: "json-rpc" as const,
      },
      {
        name: "REST API",
        description:
          "A package that provides interfaces for interacting with Alchemy REST APIs",
        value: "rest-api" as const,
      },
    ],
  });

  return {
    package: packageName,
    description,
    type,
  };
}

async function findMonorepoRoot(
  currentPath: string = import.meta.dirname,
): Promise<string> {
  if (currentPath === "/") {
    throw new Error("Could not find monorepo root");
  }

  const packageJsonPath = join(currentPath, "package.json");

  try {
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
      if (packageJson.name === "root") {
        return currentPath;
      }
    }
  } catch (error) {}

  return findMonorepoRoot(dirname(currentPath));
}

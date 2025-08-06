import { mkdir, writeFile } from "fs/promises";
import type { ListrTask } from "listr2";
import { join } from "path";
import { format } from "prettier";
import type { AddPackageOptions } from "../command.js";
import { jsonRpcDecoratorTemplate } from "./jsonRpcDecoratorTemplate.js";
import { jsonRpcDummyActionTemplate } from "./jsonRpcDummyActionTemplate.js";
import { jsonRpcDummyActionTestTemplate } from "./jsonRpcDummyActionTestTemplate.js";
import { jsonRpcIndexTemplate } from "./jsonRpcIndexTemplate.js";
import { jsonRpcSchemaTemplate } from "./jsonRpcSchemaTemplate.js";

export const jsonRpcTask = (
  config: AddPackageOptions,
  packageFolder: string,
): ListrTask => ({
  title: "Add JSON-RPC Scaffolding",
  enabled: () => config.type === "json-rpc",
  task: async (_, task) => {
    return task.newListr([
      {
        title: "Scaffolding folders",
        task: async (_, task) => {
          task.output = "Creating actions folder";
          await mkdir(join(packageFolder, "src", "actions"));
        },
      },
      {
        title: "Creating dummy action",
        task: async () => {
          await writeFile(
            join(packageFolder, "src", "actions", "dummyAction.ts"),
            await format(jsonRpcDummyActionTemplate(), {
              parser: "typescript",
            }),
          );

          await writeFile(
            join(packageFolder, "src", "actions", "dummyAction.test.ts"),
            await format(jsonRpcDummyActionTestTemplate(), {
              parser: "typescript",
            }),
          );
        },
      },
      {
        title: "Creating decorator",
        task: async () => {
          await writeFile(
            join(packageFolder, "src", "decorator.ts"),
            await format(jsonRpcDecoratorTemplate(), {
              parser: "typescript",
            }),
          );
        },
      },
      {
        title: "Creating schema file",
        task: async () => {
          await writeFile(
            join(packageFolder, "src", "schema.ts"),
            await format(jsonRpcSchemaTemplate(), {
              parser: "typescript",
            }),
          );
        },
      },
      {
        title: "Updating index.ts",
        task: async () => {
          await writeFile(
            join(packageFolder, "src", "index.ts"),
            await format(jsonRpcIndexTemplate(), {
              parser: "typescript",
            }),
          );
        },
      },
    ]);
  },
});

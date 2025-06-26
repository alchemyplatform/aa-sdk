import { mkdir, writeFile } from "fs/promises";
import type { ListrTask } from "listr2";
import { join } from "path";
import { format } from "prettier";
import type { AddPackageOptions } from "../command.js";
import { restApiDecoratorTemplate } from "./restApiDecoratorTemplate.js";
import { restApiDummyActionTemplate } from "./restApiDummyActionTemplate.js";
import { restApiDummyActionTestTemplate } from "./restApiDummyActionTestTemplate.js";
import { restApiIndexTemplate } from "./restApiIndexTemplate.js";
import { restApiSchemaTemplate } from "./restApiSchemaTemplate.js";

export const restApiTask = (
  config: AddPackageOptions,
  packageFolder: string,
): ListrTask => ({
  title: "Add REST API Scaffolding",
  enabled: () => config.type === "rest-api",
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
            await format(restApiDummyActionTemplate(), {
              parser: "typescript",
            }),
          );

          await writeFile(
            join(packageFolder, "src", "actions", "dummyAction.test.ts"),
            await format(restApiDummyActionTestTemplate(), {
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
            await format(restApiDecoratorTemplate(), {
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
            await format(restApiSchemaTemplate(), {
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
            await format(restApiIndexTemplate(), {
              parser: "typescript",
            }),
          );
        },
      },
    ]);
  },
});

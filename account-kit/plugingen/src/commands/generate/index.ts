import { asyncPipe } from "@aa-sdk/core";
import { kebabCase } from "change-case";
import dedent from "dedent";
import { default as fs } from "fs-extra";
import { basename, dirname, resolve } from "pathe";
import pc from "picocolors";
import {
  createPublicClient,
  getContract,
  http,
  type GetContractReturnType,
  type PublicClient,
} from "viem";
import z from "zod";
import type { Config, PluginConfig } from "../../config.js";
import { IPluginAbi } from "../../IPlugin.js";
import * as logger from "../../logger.js";
import { findConfig } from "../../utils/findConfig.js";
import { format } from "../../utils/format.js";
import { getIsUsingTypeScript } from "../../utils/isUsingTypescript.js";
import { resolveConfig } from "../../utils/resolveConfig.js";
import { ContractAbiGenPhase } from "./phases/contract-abi-gen.js";
import { ContractAddressesGenPhase } from "./phases/contract-addresses-gen.js";
import { ExecutionAbiGenPhase } from "./phases/execution-abi-gen.js";
import { PluginActionsGenPhase } from "./phases/plugin-actions/index.js";
import { PluginGeneratorPhase } from "./phases/plugin-generator/index.js";
import type { Phase, PhaseInput } from "./types.js";

const GenerateSchema = z.object({
  /** Path to config file */
  config: z.string().optional(),
  /** Directory to search for config file */
  root: z.string().optional(),
});

export type GenerateOptions = z.infer<typeof GenerateSchema>;

export async function generate(options: GenerateOptions = {}) {
  try {
    options = await GenerateSchema.parseAsync(options);
  } catch (error) {
    if (error instanceof z.ZodError) throw error;
    throw error;
  }

  // Get cli config file
  const configPath = await findConfig(options);
  if (!configPath) {
    if (options.config) {
      throw new Error(`Config not found at ${pc.gray(options.config)}`);
    }

    throw new Error("Config not found");
  }

  const resolvedConfigs = await resolveConfig({ configPath });
  // TODO: need to use this in the phases below and add support for JS within the generated code
  // To support that we will likely need to:
  // 1. generate a types.ts file instead of appending the types to the top of the generated code
  // 2. in generated plugin.(ts|js) files we will either import the types or use the type reference comment
  // 3. in generated plugin files we need to check if TS when specifying the types of methods
  const isTypeScript = await getIsUsingTypeScript();
  if (!isTypeScript) {
    throw new Error("Only typescript is supported at the moment.");
  }

  const outNames = new Set<string>();
  const isArrayConfig = Array.isArray(resolvedConfigs);
  const configs = isArrayConfig ? resolvedConfigs : [resolvedConfigs];

  for (const config of configs) {
    if (isArrayConfig)
      logger.log(`Using config ${pc.gray(basename(configPath))}`);

    // group configs by out dir
    if (!config.outDir) throw new Error("outDir is required.");
    if (outNames.has(config.outDir))
      throw new Error(`outDir "${config.outDir}" must be unique.`);
    outNames.add(config.outDir);
    const spinner = logger.spinner();
    const pluginConfigs = config.plugins;

    // Get contracts from config
    spinner.start("Resolving plugin contracts");
    if (!pluginConfigs || !pluginConfigs.length) {
      logger.warn("no plugins found in config");
      spinner.fail();
      return;
    }

    // TODO: check that plugins are unique
    const plugins = pluginConfigs.map((plugin) => {
      const chain = plugin.chain ?? config.chain;
      const transport = http(plugin.rpcUrl ?? config.rpcUrl);

      const client = createPublicClient({
        chain,
        transport,
      });

      if (!(chain.id in plugin.addresses)) {
        spinner.fail();
        throw new Error(
          `contract address missing for the reference chain ${chain.id}`,
        );
      }

      return {
        contract: getContract({
          address: plugin.addresses[chain.id],
          abi: IPluginAbi,
          client,
        }),
        pluginConfig: plugin,
      };
    });
    spinner.succeed();

    // Generate plugin files
    await Promise.all(
      plugins.map((plugin) =>
        generatePlugin({
          pluginConfig: plugin.pluginConfig,
          contract: plugin.contract,
          config,
        }),
      ),
    );
  }
}

// Add more phases here if needed
const phases: Phase[] = [
  ContractAddressesGenPhase,
  PluginGeneratorPhase,
  PluginActionsGenPhase,
  ExecutionAbiGenPhase,
  ContractAbiGenPhase,
];

const generatePlugin = async ({
  pluginConfig,
  contract,
  config,
}: {
  pluginConfig: PluginConfig;
  contract: GetContractReturnType<typeof IPluginAbi, PublicClient>;
  config: Config;
}) => {
  const spinner = logger.spinner();
  spinner.start(`Generating plugin ${pc.gray(pluginConfig.name)}`);
  // Setup plugin generator
  const imports: Map<
    string,
    {
      types: Set<string>;
      members: Set<string>;
    }
  > = new Map();
  const addImport: PhaseInput["addImport"] = (moduleName, member) => {
    if (!imports.has(moduleName)) {
      imports.set(moduleName, {
        types: new Set(),
        members: new Set(),
      });
    }

    const module = imports.get(moduleName)!;
    if (member.isType) {
      module.types.add(member.name);
    } else {
      module.members.add(member.name);
    }
  };
  const content: string[] = [];
  const types: Map<string, { definition: string; isPublic: boolean }> =
    new Map();
  const addType: PhaseInput["addType"] = (typeName, typeDef, isPublic) => {
    if (types.has(typeName)) {
      throw new Error(`Type ${typeName} already exists`);
    }

    types.set(typeName, {
      definition: typeDef.replace(";", ""),
      isPublic: isPublic ?? false,
    });
  };

  // TODO: we need to handle the case where this isn't typescript because right now we generate types in here
  const result = await asyncPipe(...phases)({
    addImport,
    addType,
    content,
    config,
    contract,
    pluginConfig,
  });

  // Aggregate Result of phase
  const finalContent = dedent`
  ${Array.from(types.entries())
    .map(
      ([name, type]) =>
        `${type.isPublic ? "export" : ""} type ${name} = ${type.definition};`,
    )
    .join("\n\n")}

  ${result.content.join("\n\n")}
`;

  const finalImports = Array.from(imports.entries())
    .map(([moduleName, { members, types }]) => {
      return dedent`
      import { ${Array.from(members.values()).join(",")} ${
        members.size > 0 ? "," : ""
      } ${Array.from(types.values())
        .map((x) => `type ${x}`)
        .join(",")} } from "${moduleName}";
  `;
    })
    .join("\n");
  spinner.succeed();
  await writePlugin({
    config,
    content: finalContent,
    imports: finalImports,
    pluginConfig,
  });
};

const writePlugin = async ({
  config,
  content,
  imports,
  pluginConfig,
}: {
  pluginConfig: PluginConfig;
  config: Config;
  content: string;
  imports: string;
}) => {
  const isTypeScript = await getIsUsingTypeScript();

  const pluginRegEx: RegExp = /[pP]lugin/g;
  // TODO: because we are now generating these ourselves, we have a lot more flexibility
  // We could:
  // 1. generate a types.ts file containing the type defs intead of merging them with content
  // 2. generate an extensions.ts file which doesn't get overwritten on each generation
  // 3. generate an index.ts file which correctly exports all of the types + exports the output of extensions.ts
  // so that it's easier to extend and import without conflicts
  const pluginPath = `${config.outDir}/${kebabCase(
    pluginConfig.name.replaceAll(pluginRegEx, ""),
  )}/plugin.${isTypeScript ? "ts" : "js"}`;

  const code = dedent`
    ${imports}

    ${content}
`;

  const spinner = logger.spinner();
  spinner.start(`Writing plugin to ${pc.gray(pluginPath)}`);
  // Format and write output
  const cwd = process.cwd();
  const outPath = resolve(cwd, pluginPath);
  await fs.ensureDir(dirname(outPath));
  const formatted = await format(code);
  await fs.writeFile(outPath, formatted);
  spinner.succeed();
};

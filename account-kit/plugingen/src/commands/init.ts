// borrows heavily from https://github.com/wevm/wagmi/blob/main/packages/cli/src/commands/init.ts
import dedent from "dedent";
import { default as fs } from "fs-extra";
import { relative, resolve } from "pathe";
import pc from "picocolors";
import z from "zod";
import { fromZodError } from "../errors.js";
import * as logger from "../logger.js";
import { findConfig } from "../utils/findConfig.js";
import { format } from "../utils/format.js";
import { getIsUsingTypeScript } from "../utils/isUsingTypescript.js";

export type InitOptions = {
  /** Path to config file */
  config?: string;
  /** Directory to init config file */
  root?: string;
};

const InitSchema = z.object({
  config: z.string().optional(),
  root: z.string().optional(),
});

export async function init(options: InitOptions = {}) {
  try {
    options = await InitSchema.parseAsync(options);
  } catch (error) {
    if (error instanceof z.ZodError)
      throw fromZodError(error, { prefix: "Invalid option" });
    throw error;
  }

  // Check for existing config file
  const configPath = await findConfig(options);
  if (configPath) {
    logger.info(
      `Config already exists at ${pc.gray(relative(process.cwd(), configPath))}`,
    );
    return configPath;
  }

  const spinner = logger.spinner();
  spinner.start("Creating config");
  // Check if project is using TypeScript
  const isUsingTypeScript = await getIsUsingTypeScript();
  const rootDir = resolve(options.root || process.cwd());
  let outPath: string;
  if (options.config) {
    outPath = resolve(rootDir, options.config);
  } else {
    const extension = isUsingTypeScript ? "ts" : "js";
    outPath = resolve(rootDir, `plugingen.config.${extension}`);
  }

  let content: string;
  if (isUsingTypeScript) {
    content = dedent(`
      import { defineConfig } from '@account-kit/plugingen';
      import { sepolia } from "viem/chains";
      
      export default defineConfig({
        outDir: "./src/generated",
        chain: sepolia,
        rpcUrl: "https://ethereum-sepolia.publicnode.com",
        plugins: [],
      });
    `);
  } else {
    content = dedent(`
      // @ts-check

      /** @type {import('@account-kit/plugingen').Config} */
      export default ${dedent`
      {
        outDir: "./src/generated",
        chain: sepolia,
        rpcUrl: "https://ethereum-sepolia.publicnode.com",
        plugins: [],
      }
      `.replace(/"(\d*)":/gm, "$1:")}
    `);
  }

  const formatted = await format(content);
  await fs.writeFile(outPath, formatted);
  spinner.succeed();
  logger.success(
    `Config created at ${pc.gray(relative(process.cwd(), outPath))}`,
  );

  return outPath;
}

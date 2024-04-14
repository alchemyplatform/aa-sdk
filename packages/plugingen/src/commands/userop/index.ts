// borrows heavily from https://github.com/wevm/wagmi/blob/main/packages/cli/src/commands/init.ts
import {
  LogLevel,
  Logger,
  type EntryPointVersion,
  type SendUserOperationResult,
  type UserOperationRequest,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import pc from "picocolors";
import z from "zod";
import { findConfig } from "../../utils/findConfig.js";
import { createSmartAccountClientFromConfig } from "./client.js";
import type { UserOpConfigJson } from "./type.js";
import { loadJson, validateConfig } from "./utils.js";

Logger.setLogLevel(LogLevel.DEBUG);

// Do not reorder
// In order of preference files are checked
export const configFiles = ["userop.json"];

const UserOpOptionsSchema = z.object({
  /** Path to config file */
  config: z.string().optional(),
  /** Directory to search for config file */
  root: z.string().optional(),
});

export type UserOpOptions = z.infer<typeof UserOpOptionsSchema>;

export async function buildUserOperation(
  options: UserOpOptions = {}
): Promise<UserOperationStruct<EntryPointVersion>> {
  // Get cli config file
  const configPath = await findConfig({ ...options, filenames: configFiles });
  if (!configPath) {
    if (options.config) {
      throw new Error(`Config not found at ${pc.gray(options.config)}`);
    }

    throw new Error("Config not found");
  }

  const configJson = await loadJson<UserOpConfigJson>(configPath);
  // console.log(configJson);

  const config = validateConfig(configJson);
  const client = await createSmartAccountClientFromConfig(config);

  const uoStruct = await client.buildUserOperation({
    uo: config.userop.calldata,
    overrides: config.userop.overrides,
  });

  console.log(uoStruct);
  return uoStruct;
}

export async function signUserOperation(
  options: UserOpOptions = {}
): Promise<UserOperationRequest<EntryPointVersion>> {
  // Get cli config file
  const configPath = await findConfig({ ...options, filenames: configFiles });
  if (!configPath) {
    if (options.config) {
      throw new Error(`Config not found at ${pc.gray(options.config)}`);
    }

    throw new Error("Config not found");
  }

  const configJson = await loadJson<UserOpConfigJson>(configPath);
  // console.log(configJson);

  const config = validateConfig(configJson);
  const client = await createSmartAccountClientFromConfig(config);

  const uoStruct = await client.buildUserOperation({
    uo: config.userop.calldata,
    overrides: config.userop.overrides,
  });

  const request = await client.signUserOperation({ uoStruct });
  console.log(request);
  return request;
}

export async function sendUserOperation(
  options: UserOpOptions = {}
): Promise<SendUserOperationResult<EntryPointVersion>> {
  // Get cli config file
  const configPath = await findConfig({ ...options, filenames: configFiles });
  if (!configPath) {
    if (options.config) {
      throw new Error(`Config not found at ${pc.gray(options.config)}`);
    }

    throw new Error("Config not found");
  }

  const configJson = await loadJson<UserOpConfigJson>(configPath);
  // console.log(configJson);

  const config = validateConfig(configJson);
  const client = await createSmartAccountClientFromConfig(config);

  const uoStruct = await client.buildUserOperation({
    uo: config.userop.calldata,
    overrides: config.userop.overrides,
  });

  const request = await client.signUserOperation({ uoStruct });
  console.log("sending user operation:", request);
  const entryPoint = client.account.getEntryPoint();
  const uoHash = await client.sendRawUserOperation(request, entryPoint.address);
  console.log("sent user operation hash:", uoHash);
  return {
    hash: uoHash,
    request,
  };
}

import { chains } from "@alchemy/aa-core";
import { promises as fs } from "fs";
import { createUserOpConfigSchema } from "./schema.js";
import type { UserOpConfig, UserOpConfigJson } from "./type";

export const loadJson = async <T>(path: string): Promise<T> => {
  const data = await fs.readFile(path, "utf-8");
  return JSON.parse(data) as T;
};

export const fuzzyMatch = (str: any, search: any): boolean => {
  return (
    str
      .toString()
      .toLowerCase()
      .replace(/[\W_]+/g, "") ===
    search
      .toString()
      .toLowerCase()
      .replace(/[\W_]+/g, "")
  );
};

export const validateConfig = (configJson: UserOpConfigJson): UserOpConfig => {
  const chain = Object.values(chains).find(
    (x) => x.id === configJson.chain || fuzzyMatch(x.name, configJson.chain)
  );
  if (!chain) {
    throw new Error(
      `Invalid chain in config. ${configJson.chain} does not map to a supported chain`
    );
  }

  const config: UserOpConfig = createUserOpConfigSchema(
    configJson.entrypoint
  ).parse({
    ...configJson,
    chain,
  });

  // console.log(config);
  return config;
};

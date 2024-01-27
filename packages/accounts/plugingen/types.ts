import type { NoUndefined } from "@alchemy/aa-core";
import type { Plugin } from "@wagmi/cli";
import type { GetContractReturnType, PublicClient } from "viem";
import type { PluginGenConfig } from "../plugindefs/types";
import type { IPluginAbi } from "../src/msca/abis/IPlugin";

export type PhaseInput = {
  content: string[];
  addImport: (
    moduleName: string,
    member: { name: string; isType?: boolean }
  ) => void;
  addType: (typeName: string, typeDef: string, isPublic?: boolean) => void;
  config: PluginGenConfig;
  contract: Parameters<NoUndefined<Plugin["run"]>>[0]["contracts"][number];
  plugin: GetContractReturnType<typeof IPluginAbi, PublicClient>;
  hasReadMethods?: boolean;
};

export type Phase = (input: PhaseInput) => Promise<PhaseInput>;

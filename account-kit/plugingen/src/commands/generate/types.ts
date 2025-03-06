import type { GetContractReturnType, PublicClient } from "viem";
import type { Config, PluginConfig } from "../../config.js";
import type { IPluginAbi } from "../../IPlugin.js";

export type PhaseInput = {
  content: string[];
  addImport: (
    moduleName: string,
    member: { name: string; isType?: boolean }
  ) => void;
  addType: (typeName: string, typeDef: string, isPublic?: boolean) => void;
  pluginConfig: PluginConfig;
  config: Config;
  contract: GetContractReturnType<typeof IPluginAbi, PublicClient>;
  hasReadMethods?: boolean;
};

export type Phase = (input: PhaseInput) => Promise<PhaseInput>;

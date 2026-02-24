import type { Never } from "../utils/types";

// TODO(v5): remove this file and use connectionSchema.ts instead once other packages are migrated over
type AlchemyConnectionBaseConfig =
  // TODO(v5): is this really the best devex? can we do better?
  // basic configuration for connecting to alchemy.
  // proxyUrl is used when making calls to the developer backend.
  | { proxyUrl: string; apiKey?: never; jwt?: never }
  | { proxyUrl?: never; apiKey: string; jwt?: never }
  | { proxyUrl?: never; apiKey?: never; jwt: string };

type AAOnlyChainConfig = {
  alchemyConnection: AlchemyConnectionBaseConfig;
  nodeRpcUrl: string;
};

export type AlchemyConnectionConfig =
  | (AlchemyConnectionBaseConfig & Never<AAOnlyChainConfig>)
  | (AAOnlyChainConfig & Never<AlchemyConnectionBaseConfig>);

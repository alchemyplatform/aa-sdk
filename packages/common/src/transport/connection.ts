import type { Never } from "../utils/types";
import type { SplitTransportParams } from "./split";

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
  | (AlchemyConnectionBaseConfig &
      Never<SplitTransportParams> &
      Never<AAOnlyChainConfig>)
  | (AAOnlyChainConfig &
      Never<AlchemyConnectionBaseConfig> &
      Never<SplitTransportParams>)
  // This is an escape hatch for cases where we need to split traffic but still maintain an alchemy transport
  | (SplitTransportParams & {
      restConnection: AlchemyConnectionConfig;
    } & Never<AlchemyConnectionBaseConfig> &
      Never<AAOnlyChainConfig>);

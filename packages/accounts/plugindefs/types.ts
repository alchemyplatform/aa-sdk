import type { Abi, Address, Chain } from "viem";

export type PluginGenConfig = {
  abi: Abi;
  address: Address;
  chain: Chain;
  name: string;
  // TODO: need to make this configurable to run in CI without requiring this
  rpcUrl?: string;
};

import type { Abi, Address, Chain, Hex, parseAbiParameters } from "viem";
import type { Evaluate, MaybeArray, MaybePromise } from "./types";

export type ContractConfig<
  chainId extends number = number,
  requiredChainId extends number | undefined = undefined,
> = {
  /**
   * Contract ABI
   */
  abi: Abi;
  /**
   * Contract address or addresses.
   *
   * Accepts an object `{ [chainId]: address }` to support multiple chains.
   *
   * @example
   * '0x314159265dd8dbb310642f98f50c066173c1259b'
   *
   * @example
   * {
   *   1: '0x314159265dd8dbb310642f98f50c066173c1259b',
   *   5: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
   * }
   */
  address?:
    | Address
    | (requiredChainId extends number
        ? Record<requiredChainId, Address> & Partial<Record<chainId, Address>>
        : Record<chainId, Address>)
    | undefined;
  /**
   * Name of contract.
   */
  name: string;
};

export type Contract = Evaluate<
  ContractConfig & {
    /** Generated string content */
    content: string;
    /** Meta info about contract */
    meta: {
      abiName: string;
      addressName?: string | undefined;
      configName?: string | undefined;
    };
  }
>;

export type PluginConfig = {
  abi: Abi;
  addresses: Record<number, Address>;
  // allows you to override the root config chain
  chain?: Chain;
  // allows you to override the root config rpcUrl
  rpcUrl?: string;
  name: string;
  installConfig?: {
    initAbiParams: ReturnType<typeof parseAbiParameters> | [];
    dependencies?: {
      plugin: PluginConfig;
      functionId: Hex;
    }[];
  };
};

export type Config = {
  chain: Chain;
  rpcUrl: string;
  outDir?: string;
  plugins: PluginConfig[];
};

export function defineConfig(
  config: MaybeArray<Config> | (() => MaybePromise<MaybeArray<Config>>),
) {
  return config;
}

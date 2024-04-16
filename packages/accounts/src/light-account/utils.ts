import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  toRecord,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { fromHex, type Address, type Chain } from "viem";
import type { LightAccountBase } from "./accounts/base";
import type {
  GetLightAccountType,
  IAccountVersionRegistry,
  LightAccountType,
  LightAccountVersion,
  LightAccountVersionDef,
} from "./types";

export const supportedChains: Chain[] = [
  mainnet,
  sepolia,
  goerli,
  polygon,
  polygonAmoy,
  polygonMumbai,
  optimism,
  optimismGoerli,
  optimismSepolia,
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
];

export const AccountVersionRegistry: IAccountVersionRegistry = {
  LightAccount: {
    "v1.0.1": {
      type: "LightAccount",
      version: "v1.0.1",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x000000893A26168158fbeaDD9335Be5bC96592E2".toLowerCase() as Address,
          impl: "0xc1b2fc4197c9187853243e6e4eb5a4af8879a1c0".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v1.0.2": {
      type: "LightAccount",
      version: "v1.0.2",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x00000055C0b4fA41dde26A74435ff03692292FBD".toLowerCase() as Address,
          impl: "0x5467b1947F47d0646704EB801E075e72aeAe8113".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v1.1.0": {
      type: "LightAccount",
      version: "v1.1.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        supportedChains,
        "id",
        () => ({
          factory:
            "0x00004EC70002a32400f8ae005A26081065620D20".toLowerCase() as Address,
          impl: "0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.6.0",
    },
    "v2.0.0": {
      type: "LightAccount",
      version: "v2.0.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        [arbitrumSepolia],
        "id",
        () => ({
          factory:
            "0x19B486A57C790b47Ee2E967c2aB1b8BbAeAeE7bB".toLowerCase() as Address,
          impl: "0x118c4EA651e2fE5F5637f5D8A473CB8329251f89".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.7.0",
    },
  },
  MultiOwnerLightAccount: {
    "v2.0.0": {
      type: "MultiOwnerLightAccount",
      version: "v2.0.0",
      address: toRecord<Chain, "id", { factory: Address; impl: Address }>(
        [arbitrumSepolia],
        "id",
        () => ({
          factory:
            "0xEEeB9dD9DA59bD3020C548D3543485E37ee8A50e".toLowerCase() as Address,
          impl: "0x0C93750D969bdeb51547766680E5CA14A508758e".toLowerCase() as Address,
        })
      ),
      entryPointVersion: "0.7.0",
    },
  },
};

export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType
>(
  type: TLightAccountType
): LightAccountVersion<TLightAccountType> =>
  (type === "LightAccount"
    ? "v1.1.0"
    : "v2.0.0") as LightAccountVersion<TLightAccountType>;

export const LightAccountUnsupported1271Impls = [
  AccountVersionRegistry.LightAccount["v1.0.1"],
  AccountVersionRegistry.LightAccount["v1.0.2"],
];

export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) =>
    Object.values(x.address).map((addr) => addr.factory)
  ).flat()
);

export async function getLightAccountVersionDef<
  TAccount extends LightAccountBase,
  TLightAccountType extends GetLightAccountType<TAccount> = GetLightAccountType<TAccount>
>(
  account: TAccount,
  chain: Chain
): Promise<LightAccountVersionDef<TLightAccountType>>;

export async function getLightAccountVersionDef(
  account: SmartContractAccount,
  chain: Chain
): Promise<LightAccountVersionDef> {
  const accountType = account.source as LightAccountType;
  const factoryAddress = await account.getFactoryAddress();
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          LightAccountVersion,
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].impl, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [Address, LightAccountVersion][]
  );

  const factoryToVersion = new Map(
    Object.entries(AccountVersionRegistry[accountType])
      .map((pair) => {
        const [version, def] = pair as [
          LightAccountVersion,
          LightAccountVersionDef
        ];
        return chain.id in def.address
          ? [def.address[chain.id].factory, version]
          : [null, version];
      })
      .filter(([impl]) => impl !== null) as [Address, LightAccountVersion][]
  );

  const version =
    fromHex(implAddress, "bigint") === 0n
      ? factoryToVersion.get(factoryAddress.toLowerCase() as Address)
      : implToVersion.get(implAddress.toLowerCase() as Address);

  if (!version) {
    throw new Error(
      `Could not determine ${account.source} version for chain ${chain.id}`
    );
  }

  return AccountVersionRegistry[accountType][version];
}

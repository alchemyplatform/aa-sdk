import {
  concat,
  toHex,
  custom,
  encodeFunctionData,
  type Hex,
  type Chain,
  type Address,
  type Transport,
} from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "@account-kit/infra";
import { createModularAccountV2 } from "./account/modularAccountV2.js";
import { type ModularAccountV2 } from "./account/common/modularAccountV2Base.js";
import { semiModularAccountStorageAbi } from "./abis/semiModularAccountStorageAbi.js";
import {
  AccountNotFoundError,
  ChainNotFoundError,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type UpgradeToData,
} from "@aa-sdk/core";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export type PackUOSignatureParams = {
  // orderedHookData: HookData[];
  validationSignature: Hex;
};

// TODO: direct call validation 1271
export type Pack1271SignatureParams = {
  validationSignature: Hex;
  entityId: number;
};

// Signature packing utility for user operations
export const packUOSignature = ({
  // orderedHookData, TODO: integrate in next iteration of MAv2 sdk
  validationSignature,
}: PackUOSignatureParams): Hex => {
  return concat(["0xFF", "0x00", validationSignature]);
};

// Signature packing utility for 1271 signatures
export const pack1271Signature = ({
  validationSignature,
  entityId,
}: Pack1271SignatureParams): Hex => {
  return concat([
    "0x00",
    toHex(entityId, { size: 4 }),
    "0xFF",
    "0x00", // EOA type signature
    validationSignature,
  ]);
};

export const getDefaultMAV2FactoryAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000017c61b5bEe81050EC8eFc9c6fecd";
  }
};

export const getDefaultSMAV2BytecodeAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x000000000000c5A9089039570Dd36455b5C07383";
  }
};

export const getDefaultSMAV2StorageAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x0000000000006E2f9d80CaEc0Da6500f005EB25A";
  }
};

export const getDefaultSMAV27702Address = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x69007702764179f14F51cdce752f4f775d74E139";
  }
};

export const getDefaultMAV2Address = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000002377B26b1EdA7b0BC371C60DD4f";
  }
};

export type GetMAV2UpgradeToData<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends
    | SmartContractAccountWithSigner<string, TSigner>
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined
> = GetAccountParameter<TAccount>;

/**
 * Retrieves the data necessary to upgrade to a Modular Account V2 (MA v2).
 * Note that the upgrade will be to the Semi Modular Account Storage variant
 *
 * @example
 * ```ts
 * import { createLightAccountClient, getMAV2UpgradeToData } from "@account-kit/smart-contracts";
 *
 * const client = createLightAccountClient({});
 * const upgradeData = await getMAV2UpgradeToData(client, {});
 * ```
 *
 * @param {SmartAccountClient<TTransport, TChain, TAccount>} client The smart account client
 * @param {GetMAV2UpgradeToData<TSigner, TAccount>} args The arguments required for the upgrade
 * @returns {Promise<UpgradeToData & { createMAV2Account: () => Promise<ModularAccountV2<TSigner>>}>} A promise that resolves to upgrade data augmented with a function to create a Modular Account V2
 */
export async function getMAV2UpgradeToData<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends
    | SmartContractAccountWithSigner<string, TSigner>
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: GetMAV2UpgradeToData<TSigner, TAccount>
): Promise<
  UpgradeToData & {
    createMAV2Account: () => Promise<ModularAccountV2<TSigner>>;
  }
> {
  const { account: account_ = client.account } = args;

  if (!account_) {
    throw new AccountNotFoundError();
  }
  const account = account_ as SmartContractAccountWithSigner<string, TSigner>;

  const chain = client.chain;
  if (!chain) {
    throw new ChainNotFoundError();
  }

  const initData = encodeFunctionData({
    abi: semiModularAccountStorageAbi,
    functionName: "initialize",
    args: [await account.getSigner().getAddress()],
  });

  return {
    implAddress: getDefaultSMAV2StorageAddress(chain),
    initializationData: initData,
    createMAV2Account: async () =>
      createModularAccountV2({
        transport: custom(client.transport),
        chain: chain as Chain,
        signer: account.getSigner(),
        accountAddress: account.address,
      }),
  };
}

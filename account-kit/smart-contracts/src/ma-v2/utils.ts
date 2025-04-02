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
 * @returns {Promise<UpgradeToData & { createModularAccountV2FromExisting: () => Promise<ModularAccountV2<TSigner>>}>} A promise that resolves to upgrade data augmented with a function to create a Modular Account V2
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
    createModularAccountV2FromExisting: () => Promise<
      ModularAccountV2<TSigner>
    >;
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
    createModularAccountV2FromExisting: async () =>
      createModularAccountV2({
        transport: custom(client.transport),
        chain: chain as Chain,
        signer: account.getSigner(),
        accountAddress: account.address,
      }),
  };
}

export const entityIdAndNonceReaderBytecode =
  "0x608060405234801561001057600080fd5b506040516104f13803806104f183398101604081905261002f916101e5565b60006008826001600160c01b0316901c90506000808263ffffffff1611610057576001610059565b815b90506001600160a01b0385163b15610133575b60006001600160a01b03861663d31b575b6bffffffff0000000000000000604085901b166040516001600160e01b031960e084901b1681526001600160401b03199091166004820152602401600060405180830381865afa1580156100d5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526100fd91908101906103c6565b805190915060ff161580156101155750606081015151155b156101205750610133565b8161012a816104a4565b9250505061006c565b604051631aab3f0d60e11b81526001600160a01b03868116600483015264ffffffff01600160c01b038516600884901b64ffffffff0016176024830152600091908616906335567e1a90604401602060405180830381865afa15801561019d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101c191906104d7565b90508060005260206000f35b6001600160a01b03811681146101e257600080fd5b50565b6000806000606084860312156101fa57600080fd5b8351610205816101cd565b6020850151909350610216816101cd565b60408501519092506001600160c01b038116811461023357600080fd5b809150509250925092565b634e487b7160e01b600052604160045260246000fd5b604051608081016001600160401b03811182821017156102765761027661023e565b60405290565b604051601f8201601f191681016001600160401b03811182821017156102a4576102a461023e565b604052919050565b60006001600160401b038211156102c5576102c561023e565b5060051b60200190565b600082601f8301126102e057600080fd5b81516102f36102ee826102ac565b61027c565b8082825260208201915060208360051b86010192508583111561031557600080fd5b602085015b8381101561034857805166ffffffffffffff198116811461033a57600080fd5b83526020928301920161031a565b5095945050505050565b600082601f83011261036357600080fd5b81516103716102ee826102ac565b8082825260208201915060208360051b86010192508583111561039357600080fd5b602085015b838110156103485780516001600160e01b0319811681146103b857600080fd5b835260209283019201610398565b6000602082840312156103d857600080fd5b81516001600160401b038111156103ee57600080fd5b82016080818503121561040057600080fd5b610408610254565b815160ff8116811461041957600080fd5b815260208201516001600160401b0381111561043457600080fd5b610440868285016102cf565b60208301525060408201516001600160401b0381111561045f57600080fd5b61046b868285016102cf565b60408301525060608201516001600160401b0381111561048a57600080fd5b61049686828501610352565b606083015250949350505050565b600063ffffffff821663ffffffff81036104ce57634e487b7160e01b600052601160045260246000fd5b60010192915050565b6000602082840312156104e957600080fd5b505191905056fe";

export type BuildNonceParams = {
  nonceKey?: bigint;
  entityId?: number;
  isGlobalValidation?: boolean;
  isDeferredAction?: boolean;
  isDirectCallValidation?: boolean;
};

export const buildFullNonce = ({
  nonceKey = 0n,
  entityId = 0,
  isGlobalValidation = true,
  isDeferredAction = false,
}: BuildNonceParams): bigint => {
  return (
    (nonceKey << 40n) +
    BigInt(entityId << 8) +
    (isDeferredAction ? 2n : 0n) +
    (isGlobalValidation ? 1n : 0n)
  );
};

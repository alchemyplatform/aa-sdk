import {
  concat,
  toHex,
  custom,
  encodeFunctionData,
  type Hex,
  type Chain,
  type Address,
  type Transport,
  parseAbi,
  size,
  concatHex,
  hexToNumber,
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
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined,
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
    | undefined = SmartContractAccountWithSigner<string, TSigner> | undefined,
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: GetMAV2UpgradeToData<TSigner, TAccount>,
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

export const mintableERC20Bytecode =
  "0x608060405234801561000f575f80fd5b506040518060400160405280600d81526020016c26b4b73a30b13632aa37b5b2b760991b81525060405180604001604052806002815260200161135560f21b8152508160039081610060919061010d565b50600461006d828261010d565b5050506101c7565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061009d57607f821691505b6020821081036100bb57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561010857805f5260205f20601f840160051c810160208510156100e65750805b601f840160051c820191505b81811015610105575f81556001016100f2565b50505b505050565b81516001600160401b0381111561012657610126610075565b61013a816101348454610089565b846100c1565b6020601f82116001811461016c575f83156101555750848201515b5f19600385901b1c1916600184901b178455610105565b5f84815260208120601f198516915b8281101561019b578785015182556020948501946001909201910161017b565b50848210156101b857868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b610737806101d45f395ff3fe608060405234801561000f575f80fd5b506004361061008c575f3560e01c806306fdde0314610090578063095ea7b3146100ae57806318160ddd146100d157806323b872dd146100e3578063313ce567146100f657806340c10f191461010557806370a082311461011a57806395d89b4114610142578063a9059cbb1461014a578063dd62ed3e1461015d575b5f80fd5b610098610170565b6040516100a59190610572565b60405180910390f35b6100c16100bc3660046105c2565b610200565b60405190151581526020016100a5565b6002545b6040519081526020016100a5565b6100c16100f13660046105ea565b610219565b604051601281526020016100a5565b6101186101133660046105c2565b61023c565b005b6100d5610128366004610624565b6001600160a01b03165f9081526020819052604090205490565b61009861024a565b6100c16101583660046105c2565b610259565b6100d561016b366004610644565b610266565b60606003805461017f90610675565b80601f01602080910402602001604051908101604052809291908181526020018280546101ab90610675565b80156101f65780601f106101cd576101008083540402835291602001916101f6565b820191905f5260205f20905b8154815290600101906020018083116101d957829003601f168201915b5050505050905090565b5f3361020d818585610290565b60019150505b92915050565b5f336102268582856102a2565b6102318585856102fc565b506001949350505050565b6102468282610359565b5050565b60606004805461017f90610675565b5f3361020d8185856102fc565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b61029d838383600161038d565b505050565b5f6102ad8484610266565b90505f198110156102f657818110156102e857828183604051637dc7a0d960e11b81526004016102df939291906106ad565b60405180910390fd5b6102f684848484035f61038d565b50505050565b6001600160a01b038316610325575f604051634b637e8f60e11b81526004016102df91906106ce565b6001600160a01b03821661034e575f60405163ec442f0560e01b81526004016102df91906106ce565b61029d83838361045f565b6001600160a01b038216610382575f60405163ec442f0560e01b81526004016102df91906106ce565b6102465f838361045f565b6001600160a01b0384166103b6575f60405163e602df0560e01b81526004016102df91906106ce565b6001600160a01b0383166103df575f604051634a1406b160e11b81526004016102df91906106ce565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156102f657826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161045191815260200190565b60405180910390a350505050565b6001600160a01b038316610489578060025f82825461047e91906106e2565b909155506104e69050565b6001600160a01b0383165f90815260208190526040902054818110156104c85783818360405163391434e360e21b81526004016102df939291906106ad565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661050257600280548290039055610520565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161056591815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b03811681146105bd575f80fd5b919050565b5f80604083850312156105d3575f80fd5b6105dc836105a7565b946020939093013593505050565b5f805f606084860312156105fc575f80fd5b610605846105a7565b9250610613602085016105a7565b929592945050506040919091013590565b5f60208284031215610634575f80fd5b61063d826105a7565b9392505050565b5f8060408385031215610655575f80fd5b61065e836105a7565b915061066c602084016105a7565b90509250929050565b600181811c9082168061068957607f821691505b6020821081036106a757634e487b7160e01b5f52602260045260245ffd5b50919050565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b0391909116815260200190565b8082018082111561021357634e487b7160e01b5f52601160045260245ffdfea2646970667358221220f9ae46a2e15270bfb77fe3d4d0ee0e45b749e3dde93805ee2cf795cb800244e664736f6c634300081a0033";

export const mintableERC20Abi = parseAbi([
  "function transfer(address to, uint256 amount) external",
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address target) external returns (uint256)",
]);

export type BuildNonceParams = {
  nonceKey?: bigint;
  entityId?: number;
  isGlobalValidation?: boolean;
  isDeferredAction?: boolean;
  isDirectCallValidation?: boolean;
};

export const buildFullNonceKey = ({
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

// Parses out the 3 components from a deferred action
export const parseDeferredAction = (
  deferredAction: Hex,
): {
  entityId: number;
  isGlobalValidation: boolean;
  nonce: bigint;
  deferredActionData: Hex;
  hasAssociatedExecHooks: boolean;
} => {
  // 2 for 0x, 2 for 00/01, 38 for parallel nonce, 8 for entity id, 2 for options byte, 16 for parallel nonce
  return {
    entityId: hexToNumber(`0x${deferredAction.slice(42, 50)}`),
    isGlobalValidation:
      hexToNumber(`0x${deferredAction.slice(50, 52)}`) % 2 === 1,
    nonce: BigInt(`0x${deferredAction.slice(4, 68)}`),
    deferredActionData: `0x${deferredAction.slice(68)}` as `0x${string}`,
    hasAssociatedExecHooks: deferredAction[3] === "1",
  };
};
export type BuildDeferredActionDigestParams = {
  fullPreSignatureDeferredActionDigest: Hex;
  sig: Hex;
};

/**
 * Creates the digest which must be prepended to the userOp signature.
 *
 * Assumption: The client this extends is used to sign the typed data.
 *
 * @param {object} args The argument object containing the following:
 * @param {Hex} args.fullPreSignatureDeferredActionDigest The data to append the signature and length to
 * @param {Hex} args.sig The signature to include in the digest
 * @returns {Hex} The encoded digest to be prepended to the userOp signature
 */
export const buildDeferredActionDigest = ({
  fullPreSignatureDeferredActionDigest,
  sig,
}: BuildDeferredActionDigestParams): Hex => {
  const sigLength = size(sig);

  const encodedData = concatHex([
    fullPreSignatureDeferredActionDigest,
    toHex(sigLength, { size: 4 }),
    sig,
  ]);
  return encodedData;
};

export const assertNeverSignatureRequestType = (): never => {
  throw new Error("Invalid signature request type ");
};

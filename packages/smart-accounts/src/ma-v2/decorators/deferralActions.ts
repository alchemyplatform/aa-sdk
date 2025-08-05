import {
  concatHex,
  type Hex,
  type Client,
  type Chain,
  type Transport,
  encodePacked,
  size,
  toHex,
  maxUint152,
  encodeDeployData,
  hexToNumber,
  isHex,
  type TypedDataDefinition,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { entityIdAndNonceReaderAbi } from "../abis/entityIdAndNonceReader.js";
import { getAction } from "viem/utils";
import { call } from "viem/actions";
import {
  AccountNotFoundError,
  BaseError,
  InvalidNonceKeyError,
} from "@alchemy/common";
import { buildFullNonceKey, isModularAccountV2 } from "../utils/account.js";

export const ENTITY_ID_AND_NONCE_READER_BYTECODE =
  "0x608060405234801561001057600080fd5b506040516104f13803806104f183398101604081905261002f916101e5565b60006008826001600160c01b0316901c90506000808263ffffffff1611610057576001610059565b815b90506001600160a01b0385163b15610133575b60006001600160a01b03861663d31b575b6bffffffff0000000000000000604085901b166040516001600160e01b031960e084901b1681526001600160401b03199091166004820152602401600060405180830381865afa1580156100d5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526100fd91908101906103c6565b805190915060ff161580156101155750606081015151155b156101205750610133565b8161012a816104a4565b9250505061006c565b604051631aab3f0d60e11b81526001600160a01b03868116600483015264ffffffff01600160c01b038516600884901b64ffffffff0016176024830152600091908616906335567e1a90604401602060405180830381865afa15801561019d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101c191906104d7565b90508060005260206000f35b6001600160a01b03811681146101e257600080fd5b50565b6000806000606084860312156101fa57600080fd5b8351610205816101cd565b6020850151909350610216816101cd565b60408501519092506001600160c01b038116811461023357600080fd5b809150509250925092565b634e487b7160e01b600052604160045260246000fd5b604051608081016001600160401b03811182821017156102765761027661023e565b60405290565b604051601f8201601f191681016001600160401b03811182821017156102a4576102a461023e565b604052919050565b60006001600160401b038211156102c5576102c561023e565b5060051b60200190565b600082601f8301126102e057600080fd5b81516102f36102ee826102ac565b61027c565b8082825260208201915060208360051b86010192508583111561031557600080fd5b602085015b8381101561034857805166ffffffffffffff198116811461033a57600080fd5b83526020928301920161031a565b5095945050505050565b600082601f83011261036357600080fd5b81516103716102ee826102ac565b8082825260208201915060208360051b86010192508583111561039357600080fd5b602085015b838110156103485780516001600160e01b0319811681146103b857600080fd5b835260209283019201610398565b6000602082840312156103d857600080fd5b81516001600160401b038111156103ee57600080fd5b82016080818503121561040057600080fd5b610408610254565b815160ff8116811461041957600080fd5b815260208201516001600160401b0381111561043457600080fd5b610440868285016102cf565b60208301525060408201516001600160401b0381111561045f57600080fd5b61046b868285016102cf565b60408301525060608201516001600160401b0381111561048a57600080fd5b61049686828501610352565b606083015250949350505050565b600063ffffffff821663ffffffff81036104ce57634e487b7160e01b600052601160045260246000fd5b60010192915050565b6000602082840312156104e957600080fd5b505191905056fe";

export type DeferredActionTypedData = TypedDataDefinition<
  {
    DeferredAction: [
      { name: "nonce"; type: "uint256" },
      { name: "deadline"; type: "uint48" },
      { name: "call"; type: "bytes" },
    ];
  },
  "DeferredAction"
>;

export type DeferredActionReturnData = {
  typedData: DeferredActionTypedData;
};

export type CreateDeferredActionTypedDataParams = {
  callData: Hex;
  deadline: number;
  nonce: bigint;
};

export type BuildPreSignatureDeferredActionDigestParams = {
  typedData: DeferredActionTypedData;
};

export type EntityIdAndNonceParams = {
  entityId?: number;
  nonceKey?: bigint;
  isGlobalValidation: boolean;
  isDeferredAction?: boolean;
};

export type DeferralActions = {
  createDeferredActionTypedDataObject: (
    args: CreateDeferredActionTypedDataParams
  ) => Promise<DeferredActionReturnData>;
  buildPreSignatureDeferredActionDigest: (
    args: BuildPreSignatureDeferredActionDigestParams
  ) => Hex;
  getEntityIdAndNonce: (
    args: EntityIdAndNonceParams
  ) => Promise<{ nonce: bigint; entityId: number }>;
};

/**
 * Provides deferred action functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @param {ModularAccountV2Client} client - The client instance which provides account and sendUserOperation functionality.
 * @returns {object} - An object containing three methods: `createDeferredActionTypedDataObject`, `buildDeferredActionDigest`, and `buildUserOperationWithDeferredAction`.
 */
export const deferralActions = <
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartAccount = SmartAccount,
>(
  client: Client<TTransport, TChain, TAccount>
): DeferralActions => {
  const createDeferredActionTypedDataObject = async ({
    callData,
    deadline,
    nonce,
  }: CreateDeferredActionTypedDataParams): Promise<DeferredActionReturnData> => {
    const account = client.account;
    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    return {
      typedData: {
        domain: {
          chainId: client.chain.id,
          verifyingContract: client.account.address,
        },
        types: {
          DeferredAction: [
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint48" },
            { name: "call", type: "bytes" },
          ],
        },
        primaryType: "DeferredAction",
        message: {
          nonce: nonce,
          deadline: deadline,
          call: callData,
        },
      },
    };
  };

  const buildPreSignatureDeferredActionDigest = ({
    typedData,
  }: BuildPreSignatureDeferredActionDigestParams): Hex => {
    const account = client.account;
    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    const signerEntity = account.signerEntity;
    const validationLocator =
      (BigInt(signerEntity.entityId) << 8n) |
      (signerEntity.isGlobalValidation ? 1n : 0n);

    const encodedCallData = encodePacked(
      ["uint168", "uint48", "bytes"],
      [validationLocator, typedData.message.deadline, typedData.message.call]
    );

    const encodedDataLength = size(encodedCallData);
    const encodedData = concatHex([
      toHex(encodedDataLength, { size: 4 }),
      encodedCallData,
    ]);
    return encodedData;
  };

  const getEntityIdAndNonce = async ({
    entityId = 1,
    nonceKey = 0n,
    isGlobalValidation,
    isDeferredAction = true,
  }: EntityIdAndNonceParams) => {
    const account = client.account;
    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    if (nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const bytecode = encodeDeployData({
      abi: entityIdAndNonceReaderAbi,
      bytecode: ENTITY_ID_AND_NONCE_READER_BYTECODE,
      args: [
        account.address,
        account.entryPoint.address,
        buildFullNonceKey({
          nonceKey,
          entityId,
          isGlobalValidation,
          isDeferredAction,
        }),
      ],
    });

    const action = getAction(client, call, "call");
    const { data } = await action({ data: bytecode });
    if (!data) {
      throw new BaseError("No data returned from contract call");
    }
    if (!isHex(data)) {
      throw new BaseError("Expected hex data from contract call");
    }

    return {
      nonce: BigInt(data),
      entityId: hexToNumber(`0x${data.slice(40, 48)}`),
    };
  };

  return {
    createDeferredActionTypedDataObject,
    buildPreSignatureDeferredActionDigest,
    getEntityIdAndNonce,
  };
};

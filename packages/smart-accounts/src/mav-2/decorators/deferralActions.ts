import {
  concatHex,
  type Address,
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
import {
  buildFullNonceKey,
  entityIdAndNonceReaderBytecode,
  isModularAccountV2,
} from "../utils.js";
import { entityIdAndNonceReaderAbi } from "../abis/entityIdAndNonceReader.js";
import { getAction } from "viem/utils";
import { call } from "viem/actions";
import {
  AccountNotFoundError,
  BaseError,
  InvalidNonceKeyError,
} from "@alchemy/common";

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
      bytecode: entityIdAndNonceReaderBytecode,
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

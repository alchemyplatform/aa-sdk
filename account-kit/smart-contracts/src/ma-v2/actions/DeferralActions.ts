import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  EntityIdOverrideError,
  type GetEntryPointFromAccount,
  type SendUserOperationResult,
  type UserOperationOverridesParameter,
  type SmartAccountSigner,
  InvalidNonceKeyError,
  EntryPointNotFoundError,
} from "@aa-sdk/core";
import {
  type Address,
  type Hex,
  encodeFunctionData,
  concatHex,
  zeroAddress,
  maxUint152,
  getContract,
} from "viem";
import type { ModularAccountV2Client } from "../client/client.js";

export type DeferredActionTypedData = {
  domain: {
    chainId: number;
    verifyingContract: Address;
  };
  types: {
    DeferredAction: [
      { name: "nonce"; type: "uint256" },
      { name: "deadline"; type: "uint48" },
      { name: "call"; type: "bytes" }
    ];
  };
  primaryType: "DeferredAction";
  message: {
    nonce: bigint;
    deadline: number;
    call: Hex;
  };
};

export type DeferredActionReturnData = {
  typedData: DeferredActionTypedData;
  nonceOverride: bigint;
};

export type CreateTypedDataParams = {
  callData: Hex;
  deadline: number;
  entityId: number;
  isGlobalValidation: boolean;
  nonceKeyOverride?: bigint;
};

export type DeferralActions<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  createDeferredActionTypedDataObject: (
    args: CreateTypedDataParams
  ) => Promise<DeferredActionReturnData>;
};

/**
 * Provides validation installation and uninstallation functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @example
 * ```ts
 
 *
 * ```
 *
 * @param {ModularAccountV2Client} client - The client instance which provides account and sendUserOperation functionality.
 * @returns {object} - An object containing two methods, `installValidation` and `uninstallValidation`.
 */
export const deferralActions: <
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  client: ModularAccountV2Client
) => DeferralActions<TSigner> = (
  client: ModularAccountV2Client
): DeferralActions => {
  const createDeferredActionTypedDataObject = async ({
    callData,
    deadline,
    entityId,
    isGlobalValidation,
    nonceKeyOverride,
  }: CreateTypedDataParams): Promise<DeferredActionReturnData> => {
    if (!client.account) {
      throw new AccountNotFoundError();
    }

    const baseNonceKey = nonceKeyOverride || 0n;
    if (baseNonceKey > maxUint152) {
      throw new InvalidNonceKeyError(baseNonceKey);
    }

    const entryPoint = client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw new EntryPointNotFoundError(client.chain, "0.7.0");
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client: client,
    });

    // 2 = deferred action flags    0b10
    // 1 = isGlobal validation flag 0b01
    const fullNonceKey: bigint =
      ((baseNonceKey << 40n) + (BigInt(entityId) << 8n)) |
      2n |
      (isGlobalValidation ? 1n : 0n);

    const nonceOverride = (await entryPointContract.read.getNonce([
      client.account.address,
      fullNonceKey,
    ])) as bigint;

    return {
      typedData: {
        domain: {
          chainId: await client.getChainId(),
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
          nonce: nonceOverride,
          deadline: deadline,
          call: callData,
        },
      },
      nonceOverride: nonceOverride,
    };
  };
  return {
    createDeferredActionTypedDataObject,
  };
};

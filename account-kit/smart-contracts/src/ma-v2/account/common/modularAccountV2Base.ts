import {
  createBundlerClient,
  getEntryPoint,
  InvalidEntityIdError,
  InvalidNonceKeyError,
  toSmartContractAccount,
  type AccountOp,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
} from "@aa-sdk/core";
import { DEFAULT_OWNER_ENTITY_ID } from "../../utils.js";
import {
  type Hex,
  type Address,
  type Chain,
  type Transport,
  encodeFunctionData,
  maxUint32,
  zeroAddress,
  getContract,
  concatHex,
  maxUint152,
} from "viem";
import { modularAccountAbi } from "../../abis/modularAccountAbi.js";
import { serializeModuleEntity } from "../../actions/common/utils.js";
import { nativeSMASigner } from "../nativeSMASigner.js";
import { singleSignerMessageSigner } from "../../modules/single-signer-validation/signer.js";

export const executeUserOpSelector: Hex = "0x8DD7712F";

export type SignerEntity = {
  isGlobalValidation: boolean;
  entityId: number;
};

export type ExecutionDataView = {
  module: Address;
  skipRuntimeValidation: boolean;
  allowGlobalValidation: boolean;
  executionHooks: readonly Hex[];
};

export type ValidationDataView = {
  validationHooks: readonly Hex[];
  executionHooks: readonly Hex[];
  selectors: readonly Hex[];
  validationFlags: number;
};

export type ValidationDataParams =
  | {
      validationModuleAddress: Address;
      entityId?: never;
    }
  | {
      validationModuleAddress?: never;
      entityId: number;
    };

export type DeferredAction = {
  data: Hex;
  hasAssociatedExecHooks: boolean;
  nonce: bigint;
};

export type ModularAccountV2<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"ModularAccountV2", TSigner, "0.7.0"> & {
  signerEntity: SignerEntity;
  getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
  getValidationData: (
    args: ValidationDataParams
  ) => Promise<ValidationDataView>;
  encodeCallData: (callData: Hex) => Promise<Hex>;
};

export type CreateMAV2BaseParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TTransport extends Transport = Transport
> = Omit<
  ToSmartContractAccountParams<"ModularAccountV2", TTransport, Chain, "0.7.0">,
  // Implements the following methods required by `toSmartContractAccount`, and passes through any other parameters.
  | "encodeExecute"
  | "encodeBatchExecute"
  | "getNonce"
  | "signMessage"
  | "signTypedData"
  | "getDummySignature"
> & {
  signer: TSigner;
  signerEntity?: SignerEntity;
  accountAddress: Address;
  deferredAction?: DeferredAction;
};

export type CreateMAV2BaseReturnType<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Promise<ModularAccountV2<TSigner>>;

export async function createMAv2Base<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(config: CreateMAV2BaseParams<TSigner>): CreateMAV2BaseReturnType<TSigner> {
  const {
    transport,
    chain,
    signer,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity = {
      isGlobalValidation: true,
      entityId: DEFAULT_OWNER_ENTITY_ID,
    },
    signerEntity: {
      isGlobalValidation = true,
      entityId = DEFAULT_OWNER_ENTITY_ID,
    } = {},
    accountAddress,
    deferredAction,
    ...remainingToSmartContractAccountParams
  } = config;

  if (entityId > Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId);
  }

  const client = createBundlerClient({
    transport,
    chain,
  });

  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: entryPoint.abi,
    client,
  });

  let useDeferredAction: boolean = false;

  if (deferredAction) {
    // Set these values if the deferred action has not been consumed. We check this with the EP
    const nextNonceForDeferredActionNonce: bigint =
      (await entryPointContract.read.getNonce([
        accountAddress,
        deferredAction.nonce >> 64n,
      ])) as bigint;

    // we only add the deferred action in if the nonce has not been consumed
    if (deferredAction.nonce === nextNonceForDeferredActionNonce) {
      useDeferredAction = true;
    } else if (deferredAction.nonce > nextNonceForDeferredActionNonce) {
      throw new Error("Deferred action nonce invalid");
    }
  }

  const encodeExecute: (tx: AccountOp) => Promise<Hex> = async ({
    target,
    data,
    value,
  }) =>
    await encodeCallData(
      encodeFunctionData({
        abi: modularAccountAbi,
        functionName: "execute",
        args: [target, value ?? 0n, data],
      })
    );

  const encodeBatchExecute: (txs: AccountOp[]) => Promise<Hex> = async (txs) =>
    await encodeCallData(
      encodeFunctionData({
        abi: modularAccountAbi,
        functionName: "executeBatch",
        args: [
          txs.map((tx) => ({
            target: tx.target,
            data: tx.data,
            value: tx.value ?? 0n,
          })),
        ],
      })
    );

  const isAccountDeployed: () => Promise<boolean> = async () =>
    !!(await client.getCode({ address: accountAddress }));

  const getNonce = async (nonceKey: bigint = 0n): Promise<bigint> => {
    if (useDeferredAction && deferredAction) {
      return deferredAction.nonce;
    }

    if (nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const fullNonceKey: bigint =
      (nonceKey << 40n) +
      (BigInt(entityId) << 8n) +
      (isGlobalValidation ? 1n : 0n);

    return entryPointContract.read.getNonce([
      accountAddress,
      fullNonceKey,
    ]) as Promise<bigint>;
  };

  const accountContract = getContract({
    address: accountAddress,
    abi: modularAccountAbi,
    client,
  });

  const getExecutionData = async (selector: Hex) => {
    if (!(await isAccountDeployed())) {
      return {
        module: zeroAddress,
        skipRuntimeValidation: false,
        allowGlobalValidation: false,
        executionHooks: [],
      };
    }

    return await accountContract.read.getExecutionData([selector]);
  };

  const getValidationData = async (args: ValidationDataParams) => {
    if (!(await isAccountDeployed())) {
      return {
        validationHooks: [],
        executionHooks: [],
        selectors: [],
        validationFlags: 0,
      };
    }

    const { validationModuleAddress, entityId } = args;
    return await accountContract.read.getValidationData([
      serializeModuleEntity({
        moduleAddress: validationModuleAddress ?? zeroAddress,
        entityId: entityId ?? Number(maxUint32),
      }),
    ]);
  };

  const encodeCallData = async (callData: Hex): Promise<Hex> => {
    const validationData = await getValidationData({
      entityId: Number(entityId),
    });

    return (useDeferredAction && deferredAction?.hasAssociatedExecHooks) ||
      validationData.executionHooks.length
      ? concatHex([executeUserOpSelector, callData])
      : callData;
  };

  const deferredActionData = useDeferredAction
    ? deferredAction?.data
    : undefined;

  const baseAccount = await toSmartContractAccount({
    ...remainingToSmartContractAccountParams,
    transport,
    chain,
    entryPoint,
    accountAddress,
    encodeExecute,
    encodeBatchExecute,
    getNonce,
    ...(entityId === DEFAULT_OWNER_ENTITY_ID
      ? nativeSMASigner(signer, chain, accountAddress, deferredActionData)
      : singleSignerMessageSigner(
          signer,
          chain,
          accountAddress,
          entityId,
          deferredActionData
        )),
  });

  return {
    ...baseAccount,
    getSigner: () => signer,
    signerEntity,
    getExecutionData,
    getValidationData,
    encodeCallData,
  };
}

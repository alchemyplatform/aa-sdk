import {
  createBundlerClient,
  getEntryPoint,
  InvalidEntityIdError,
  InvalidNonceKeyError,
  type AccountOp,
  type EntryPointDef,
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

export type MAV2Account<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"MAV2Account", TSigner, "0.7.0"> & {
  signerEntity: SignerEntity;
  getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
  getValidationData: (
    args: ValidationDataParams
  ) => Promise<ValidationDataView>;
  encodeCallData: (callData: Hex) => Promise<Hex>;
};

export type CreateMAV2BaseFunctionsParams<
  TTransport extends Transport = Transport
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain"
> & {
  // salt?: bigint;
  // factoryAddress?: Address;
  // initCode?: Hex;
  // initialOwner?: Address;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  signerEntity?: SignerEntity;
  accountAddress: Address;
};

export async function createMAv2BaseFunctions(
  config: CreateMAV2BaseFunctionsParams
) {
  const {
    transport,
    chain,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity: {
      isGlobalValidation = true,
      entityId = DEFAULT_OWNER_ENTITY_ID,
    } = {},
    accountAddress,
  } = config;

  if (entityId > Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId);
  }

  const client = createBundlerClient({
    transport,
    chain,
  });

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
  // TODO: add deferred action flag
  const getAccountNonce = async (nonceKey: bigint = 0n): Promise<bigint> => {
    if (nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client,
    });

    const fullNonceKey: bigint =
      (nonceKey << 40n) +
      BigInt(entityId << 8) +
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

    return validationData.executionHooks.length
      ? concatHex([executeUserOpSelector, callData])
      : callData;
  };

  return {
    getExecutionData,
    getValidationData,
    encodeCallData,
    getAccountNonce,
    encodeExecute,
    encodeBatchExecute,
  };
}

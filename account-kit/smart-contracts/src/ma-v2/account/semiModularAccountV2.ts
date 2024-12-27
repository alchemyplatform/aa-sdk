import type {
  EntryPointDef,
  SmartAccountSigner,
  AccountOp,
  SmartContractAccountWithSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  createBundlerClient,
  getEntryPoint,
  toSmartContractAccount,
  InvalidEntityIdError,
  InvalidNonceKeyError,
  getAccountAddress,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  maxUint32,
  maxUint152,
  zeroAddress,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import {
  getDefaultMAV2FactoryAddress,
  DEFAULT_OWNER_ENTITY_ID,
} from "../utils.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";
import { nativeSMASigner } from "./nativeSMASigner.js";
import { modularAccountAbi } from "../abis/modularAccountAbi.js";
import { serializeModuleEntity } from "../actions/common/utils.js";

const executeUserOpSelector: Hex = "0x8DD7712F";

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

export type CreateSMAV2AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"MAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  initialOwner?: Address;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
  signerEntity?: SignerEntity;
};

export async function createSMAV2Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMAV2AccountParams<TTransport, TSigner>
): Promise<MAV2Account<TSigner>>;

export async function createSMAV2Account(
  config: CreateSMAV2AccountParams
): Promise<MAV2Account> {
  const {
    transport,
    chain,
    signer,
    salt = 0n,
    factoryAddress = getDefaultMAV2FactoryAddress(chain),
    initCode,
    initialOwner,
    accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    signerEntity = {
      isGlobalValidation: true,
      entityId: DEFAULT_OWNER_ENTITY_ID,
    },
    signerEntity: {
      isGlobalValidation = true,
      entityId = DEFAULT_OWNER_ENTITY_ID,
    } = {},
  } = config;

  if (entityId > Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId);
  }

  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

    // If an initial owner is not provided, use the signer's address
    const ownerAddress = initialOwner ?? (await signer.getAddress());

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: accountFactoryAbi,
        functionName: "createSemiModularAccount",
        args: [ownerAddress, salt],
      }),
    ]);
  };

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

  const _accountAddress = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress: _accountAddress,
    source: `MAV2Account`,
    encodeExecute,
    encodeBatchExecute,
    getAccountInitCode,
    ...(entityId === DEFAULT_OWNER_ENTITY_ID
      ? nativeSMASigner(signer, chain, _accountAddress)
      : singleSignerMessageSigner(signer, chain, _accountAddress, entityId)),
  });

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
      _accountAddress,
      fullNonceKey,
    ]) as Promise<bigint>;
  };

  const accountContract = getContract({
    address: _accountAddress,
    abi: modularAccountAbi,
    client,
  });

  const getExecutionData = async (selector: Hex) => {
    if (!(await baseAccount.isAccountDeployed())) {
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
    if (!(await baseAccount.isAccountDeployed())) {
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
    ...baseAccount,
    getAccountNonce,
    getSigner: () => signer,
    signerEntity,
    getExecutionData,
    getValidationData,
    encodeCallData,
  };
}

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
  getAccountAddress,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  maxUint32,
  maxUint152,
  type Address,
  type Chain,
  type Hex,
  type Transport,
  zeroAddress,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { getDefaultMAV2FactoryAddress } from "../utils.js";
import { standardExecutor } from "../../msca/account/standardExecutor.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";
import { InvalidEntityIdError, InvalidNonceKeyError } from "@aa-sdk/core";
import { modularAccountAbi } from "../abis/modularAccountAbi.js";
import { serializeModuleEntity } from "../actions/common/utils.js";

const executeUserOpSelector: Hex = "0x8DD7712F";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export type CalldataEncoder = {
  encodeCallData: (callData: Hex) => Promise<Hex>;
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

export type ValidationDataParams = {
  validationModuleAddress?: Address;
  entityId?: number;
};

export type SMAV2Account<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TCalldataEncoder extends CalldataEncoder = CalldataEncoder
> = SmartContractAccountWithSigner<"SMAV2Account", TSigner, "0.7.0"> &
  TCalldataEncoder & {
    getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
    getValidationData: (
      args: ValidationDataParams
    ) => Promise<ValidationDataView>;
  };

export type CreateSMAV2AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<"SMAV2Account", TTransport, Chain, "0.7.0">,
  "transport" | "chain" | "accountAddress"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  initialOwner?: Address;
  entryPoint?: EntryPointDef<"0.7.0", Chain>;
} & (
    | {
        isGlobalValidation: boolean;
        entityId: number;
      }
    | {
        isGlobalValidation?: never;
        entityId?: never;
      }
  );

export async function createSMAV2Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMAV2AccountParams<TTransport, TSigner>
): Promise<SMAV2Account<TSigner> & CalldataEncoder>;

export async function createSMAV2Account(
  config: CreateSMAV2AccountParams
): Promise<SMAV2Account & CalldataEncoder> {
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
    isGlobalValidation = true,
    entityId = 0,
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

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress,
    source: `SMAV2Account`,
    getAccountInitCode,
    ...standardExecutor,
    ...singleSignerMessageSigner(signer),
  });

  const accountAddress_ = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  // TODO: add deferred action flag
  const getAccountNonce = async (nonceKey?: bigint): Promise<bigint> => {
    if (nonceKey && nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client,
    });

    const fullNonceKey: bigint =
      (nonceKey ? nonceKey << 40n : 0n) +
      BigInt(entityId << 8) +
      (isGlobalValidation ? 1n : 0n);

    return entryPointContract.read.getNonce([
      baseAccount.address,
      fullNonceKey,
    ]) as Promise<bigint>;
  };

  const accountContract = getContract({
    address: baseAccount.address,
    abi: modularAccountAbi,
    client,
  });

  const getExecutionData = async (selector: Hex) => {
    if (!(await baseAccount.isAccountDeployed())) {
      return {} as ExecutionDataView;
    }

    return await accountContract.read.getExecutionData([selector]);
  };

  const getValidationData = async (args: ValidationDataParams) => {
    if (!(await baseAccount.isAccountDeployed())) {
      return {} as ValidationDataView;
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

    const numHooks = validationData?.executionHooks?.length ?? 0;

    return numHooks ? concatHex([executeUserOpSelector, callData]) : callData;
  };

  const encodeExecute: (tx: AccountOp) => Promise<Hex> = async ({
    target,
    data,
    value,
  }) => {
    let callData = encodeFunctionData({
      abi: modularAccountAbi,
      functionName: "execute",
      args: [target, value ?? 0n, data],
    });

    callData = (await baseAccount.isAccountDeployed())
      ? await encodeCallData(callData)
      : callData;

    return callData;
  };

  const encodeBatchExecute: (txs: AccountOp[]) => Promise<Hex> = async (txs) =>
    encodeCallData(
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

  return {
    ...baseAccount,
    getAccountNonce,
    getSigner: () => signer,
    getExecutionData,
    getValidationData,
    encodeExecute,
    encodeBatchExecute,
    encodeCallData,
  };
}

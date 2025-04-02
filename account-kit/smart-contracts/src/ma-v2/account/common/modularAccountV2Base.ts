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
  hexToBigInt,
  hexToNumber,
  decodeFunctionData,
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
      deferredActionDigest?: never;
    }
  | {
      validationModuleAddress?: never;
      entityId: number;
      deferredActionDigest?: never;
    }
  | {
      deferredActionDigest: Hex;
      validationModuleAddress?: never;
      entityId?: never;
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
  deferredActionDigest?: Hex;
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
    deferredActionDigest,
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

  let deferredAction:
    | undefined
    | { nonce: bigint; data: Hex; hasAssociatedExecHooks: boolean };

  // deferred action format:
  // 32 bytes nonce | 4 bytes len | 21 bytes valLocator | 8 bytes deadline |
  // variable bytes calldata | 4 bytes sig length | variable bytes sig
  if (deferredActionDigest) {
    // we always infer entityId and isGlobalValidation from the deferred action case
    // this number here is in the range of [0, 7]
    if (Number(deferredActionDigest[116]) >= 4) {
      // TODO: implement > 4 case which is direct validation
      throw new Error("Direct call validation not supported yet");
    } else {
      // 1st bit is isGlobalValidation, 2nd bit is isDeferredAction
      signerEntity.isGlobalValidation =
        Number(deferredActionDigest[116]) % 2 === 0 ? false : true;
      signerEntity.entityId = hexToNumber(
        `0x${deferredActionDigest.slice(98, 116)}`
      );
    }

    // Set these values if the deferred action has not been consumed. We check this with the EP
    const deferredActionNonce = hexToBigInt(
      `0x${deferredActionDigest.slice(2, 66)}`
    );
    const nextNonceForDeferredActionNonceKey: bigint =
      (await entryPointContract.read.getNonce([
        accountAddress,
        deferredActionNonce >> 64n,
      ])) as bigint;
    if (deferredActionNonce === nextNonceForDeferredActionNonceKey) {
      // parse deferred action to get
      const callBytesLength =
        hexToNumber(`0x${deferredActionDigest.slice(66, 74)}`) - 29;
      if (callBytesLength < 4) {
        throw new Error("Invalid deferred action calldata length");
      }
      const deferredActionCall = decodeFunctionData({
        abi: modularAccountAbi,
        data: `0x${deferredActionDigest.slice(132, 132 + callBytesLength * 2)}`,
      });

      const hooks =
        deferredActionCall.functionName !== "installValidation"
          ? []
          : deferredActionCall.args[3];

      deferredAction = {
        nonce: deferredActionNonce,
        data: `0x${deferredActionDigest.slice(66)}`,
        // get the 25th byte of each hook, execution hooks have the 1st bit empty and val have it set.
        // for a string, this is 2 (0x) + 2 * 25 = 52
        // we can just get the single character since we are just checking a single bit
        hasAssociatedExecHooks: hooks.map((h) => Number(h[52]) % 2).includes(0),
      };
    } else if (nextNonceForDeferredActionNonceKey < deferredActionNonce) {
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
    if (deferredAction) {
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

    return deferredAction?.hasAssociatedExecHooks ||
      validationData.executionHooks.length
      ? concatHex([executeUserOpSelector, callData])
      : callData;
  };

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
      ? nativeSMASigner(signer, chain, accountAddress, deferredAction?.data)
      : singleSignerMessageSigner(
          signer,
          chain,
          accountAddress,
          entityId,
          deferredAction?.data
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

import {
  createBundlerClient,
  getEntryPoint,
  InvalidDeferredActionNonce,
  InvalidEntityIdError,
  InvalidNonceKeyError,
  toSmartContractAccount,
  type AccountOp,
  type SmartAccountSigner,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  maxUint152,
  maxUint32,
  zeroAddress,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import type { ToWebAuthnAccountParameters } from "viem/account-abstraction";
import { modularAccountAbi } from "../../abis/modularAccountAbi.js";
import { serializeModuleEntity } from "../../actions/common/utils.js";
import { singleSignerMessageSigner } from "../../modules/single-signer-validation/signer.js";
import { webauthnSigningFunctions } from "../../modules/webauthn-validation/signingMethods.js";
import { DEFAULT_OWNER_ENTITY_ID, parseDeferredAction } from "../../utils.js";
import { nativeSMASigner } from "../nativeSMASigner.js";

export const executeUserOpSelector: Hex = "0x8DD7712F";

export type ModularAccountsV2 = ModularAccountV2 | WebauthnModularAccountV2;

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

export type ModularAccountV2<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = SmartContractAccountWithSigner<"ModularAccountV2", TSigner, "0.7.0"> & {
  signerEntity: SignerEntity;
  getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
  getValidationData: (
    args: ValidationDataParams,
  ) => Promise<ValidationDataView>;
  encodeCallData: (callData: Hex) => Promise<Hex>;
};

export type WebauthnModularAccountV2 = SmartContractAccount<
  "ModularAccountV2",
  "0.7.0"
> & {
  params: ToWebAuthnAccountParameters;
  signerEntity: SignerEntity;
  getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
  getValidationData: (
    args: ValidationDataParams,
  ) => Promise<ValidationDataView>;
  encodeCallData: (callData: Hex) => Promise<Hex>;
};

export type CreateMAV2BaseParams<
  TSigner extends SmartAccountSigner | undefined =
    | SmartAccountSigner
    | undefined,
  TTransport extends Transport = Transport,
> = Omit<
  ToSmartContractAccountParams<"ModularAccountV2", TTransport, Chain, "0.7.0">,
  // Implements the following methods required by `toSmartContractAccount`, and passes through any other parameters.
  | "encodeExecute"
  | "encodeBatchExecute"
  | "getNonce"
  | "signMessage"
  | "signTypedData"
  | "getDummySignature"
  | "prepareSign"
  | "formatSign"
> & {
  signer: TSigner;
  signerEntity?: SignerEntity;
  accountAddress: Address;
  deferredAction?: Hex;
};

export type CreateWebauthnMAV2BaseParams = Omit<
  CreateMAV2BaseParams,
  "signer"
> & {
  credential: ToWebAuthnAccountParameters["credential"];
  getFn?: ToWebAuthnAccountParameters["getFn"] | undefined;
  rpId?: ToWebAuthnAccountParameters["rpId"] | undefined;
};

export type CreateMAV2BaseReturnType<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = Promise<ModularAccountV2<TSigner>>;

// function overload
export async function createMAv2Base(
  config: CreateWebauthnMAV2BaseParams,
): Promise<WebauthnModularAccountV2>;

export async function createMAv2Base<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(config: CreateMAV2BaseParams): CreateMAV2BaseReturnType<TSigner>;

export async function createMAv2Base<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  config: CreateMAV2BaseParams<TSigner> | CreateWebauthnMAV2BaseParams,
): Promise<WebauthnModularAccountV2 | ModularAccountV2<TSigner>> {
  let {
    transport,
    chain,
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

  const signer = "signer" in config ? config.signer : undefined;
  const credential = "credential" in config ? config.credential : undefined;
  const getFn = "getFn" in config ? config.getFn : undefined;
  const rpId = "rpId" in config ? config.rpId : undefined;

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

  // These default values signal that we should not use the set deferred action nonce
  let nonce: bigint | undefined;
  let deferredActionData: Hex | undefined;
  let hasAssociatedExecHooks: boolean = false;

  if (deferredAction) {
    let deferredActionNonce: bigint = 0n;
    // We always update entity id and isGlobalValidation to the deferred action value since the client could be used to send multiple calls
    ({
      entityId,
      isGlobalValidation,
      nonce: deferredActionNonce,
    } = parseDeferredAction(deferredAction));

    // Set these values if the deferred action has not been consumed. We check this with the EP
    const nextNonceForDeferredAction: bigint =
      (await entryPointContract.read.getNonce([
        accountAddress,
        deferredActionNonce >> 64n,
      ])) as bigint;

    if (deferredActionNonce === nextNonceForDeferredAction) {
      ({ nonce, deferredActionData, hasAssociatedExecHooks } =
        parseDeferredAction(deferredAction));
    } else if (deferredActionNonce > nextNonceForDeferredAction) {
      // if nonce is greater than the next nonce, its invalid, so we throw
      throw new InvalidDeferredActionNonce();
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
      }),
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
      }),
    );

  const isAccountDeployed: () => Promise<boolean> = async () =>
    !!(await client.getCode({ address: accountAddress }));

  const getNonce = async (nonceKey: bigint = 0n): Promise<bigint> => {
    if (nonce) {
      const tempNonce = nonce;
      nonce = undefined; // set to falsy value once used
      return tempNonce;
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
    if (hasAssociatedExecHooks) {
      hasAssociatedExecHooks = false; // set to falsy value once used
      return concatHex([executeUserOpSelector, callData]);
    }
    if (validationData.executionHooks.length) {
      return concatHex([executeUserOpSelector, callData]);
    }
    return callData;
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
    ...(signer
      ? entityId === DEFAULT_OWNER_ENTITY_ID
        ? nativeSMASigner(signer, chain, accountAddress, deferredActionData)
        : singleSignerMessageSigner(
            signer,
            chain,
            accountAddress,
            entityId,
            deferredActionData,
          )
      : webauthnSigningFunctions(
          // credential required for webauthn mode is checked at modularAccountV2 creation level
          credential!,
          getFn,
          rpId,
          chain,
          accountAddress,
          entityId,
          deferredActionData,
        )),
  });

  if (!signer) {
    return {
      ...baseAccount,
      signerEntity,
      getExecutionData,
      getValidationData,
      encodeCallData,
    } as WebauthnModularAccountV2; // TO DO: figure out when this breaks! we shouldn't have to cast
  }

  return {
    ...baseAccount,
    getSigner: () => signer,
    signerEntity,
    getExecutionData,
    getValidationData,
    encodeCallData,
  } as ModularAccountV2<TSigner>; // TO DO: figure out when this breaks! we shouldn't have to cast
}

export function isModularAccountV2(
  account: SmartContractAccount,
): account is ModularAccountV2 | WebauthnModularAccountV2 {
  return account.source === "ModularAccountV2";
}

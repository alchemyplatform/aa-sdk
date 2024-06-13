import {
  getContract,
  hexToBytes,
  trim,
  type Address,
  type Chain,
  type CustomSource,
  type Hex,
  type LocalAccount,
  type PublicClient,
  type SignableMessage,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { toAccount } from "viem/accounts";
import { createBundlerClient } from "../client/bundlerClient.js";
import type {
  EntryPointDef,
  EntryPointRegistryBase,
  EntryPointVersion,
} from "../entrypoint/types.js";
import {
  BatchExecutionNotSupportedError,
  FailedToGetStorageSlotError,
  GetCounterFactualAddressError,
  SignTransactionNotSupportedError,
  UpgradesNotSupportedError,
} from "../errors/account.js";
import { InvalidRpcUrlError } from "../errors/client.js";
import { InvalidEntryPointError } from "../errors/entrypoint.js";
import { Logger } from "../logger.js";
import type { SmartAccountSigner } from "../signer/types.js";
import { wrapSignatureWith6492 } from "../signer/utils.js";
import type { NullAddress } from "../types.js";
import type { IsUndefined } from "../utils/types.js";
import { DeploymentState } from "./base.js";

export type AccountOp = {
  target: Address;
  value?: bigint;
  data: Hex | "0x";
};

export type GetEntryPointFromAccount<
  TAccount extends SmartContractAccount | undefined,
  TAccountOverride extends SmartContractAccount = SmartContractAccount
> = GetAccountParameter<
  TAccount,
  TAccountOverride
> extends SmartContractAccount<string, infer TEntryPointVersion>
  ? TEntryPointVersion
  : EntryPointVersion;

export type GetAccountParameter<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TAccountOverride extends SmartContractAccount = SmartContractAccount
> = IsUndefined<TAccount> extends true
  ? { account: TAccountOverride }
  : { account?: TAccountOverride };

export type UpgradeToAndCallParams = {
  upgradeToAddress: Address;
  upgradeToInitData: Hex;
};

export type SmartContractAccountWithSigner<
  Name extends string = string,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = SmartContractAccount<Name, TEntryPointVersion> & {
  getSigner: () => TSigner;
};

export const isSmartAccountWithSigner = (
  account: SmartContractAccount
): account is SmartContractAccountWithSigner => {
  return "getSigner" in account;
};

// [!region SmartContractAccount]
export type SmartContractAccount<
  Name extends string = string,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = LocalAccount<Name> & {
  source: Name;
  getDummySignature: () => Hex | Promise<Hex>;
  encodeExecute: (tx: AccountOp) => Promise<Hex>;
  encodeBatchExecute: (txs: AccountOp[]) => Promise<Hex>;
  signUserOperationHash: (uoHash: Hex) => Promise<Hex>;
  signMessageWith6492: (params: { message: SignableMessage }) => Promise<Hex>;
  signTypedDataWith6492: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>
  ) => Promise<Hex>;
  encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;
  getNonce(nonceKey?: bigint): Promise<bigint>;
  getInitCode: () => Promise<Hex>;
  isAccountDeployed: () => Promise<boolean>;
  getFactoryAddress: () => Promise<Address>;
  getFactoryData: () => Promise<Hex>;
  getEntryPoint: () => EntryPointDef<TEntryPointVersion>;
  getImplementationAddress: () => Promise<NullAddress | Address>;
};
// [!endregion SmartContractAccount]

export interface AccountEntryPointRegistry<Name extends string = string>
  extends EntryPointRegistryBase<
    SmartContractAccount<Name, EntryPointVersion>
  > {
  "0.6.0": SmartContractAccount<Name, "0.6.0">;
  "0.7.0": SmartContractAccount<Name, "0.7.0">;
}

// [!region ToSmartContractAccountParams]
export type ToSmartContractAccountParams<
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  source: Name;
  transport: TTransport;
  chain: TChain;
  entryPoint: EntryPointDef<TEntryPointVersion, TChain>;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
  getDummySignature: () => Hex | Promise<Hex>;
  encodeExecute: (tx: AccountOp) => Promise<Hex>;
  encodeBatchExecute?: (txs: AccountOp[]) => Promise<Hex>;
  // if not provided, will default to just using signMessage over the Hex
  signUserOperationHash?: (uoHash: Hex) => Promise<Hex>;
  encodeUpgradeToAndCall?: (params: UpgradeToAndCallParams) => Promise<Hex>;
} & Omit<CustomSource, "signTransaction" | "address">;
// [!endregion ToSmartContractAccountParams]

export const parseFactoryAddressFromAccountInitCode = (
  initCode: Hex
): [Address, Hex] => {
  const factoryAddress: Address = `0x${initCode.substring(2, 42)}`;
  const factoryCalldata: Hex = `0x${initCode.substring(42)}`;
  return [factoryAddress, factoryCalldata];
};

export const getAccountAddress = async ({
  client,
  entryPoint,
  accountAddress,
  getAccountInitCode,
}: {
  client: PublicClient;
  entryPoint: EntryPointDef;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
}) => {
  if (accountAddress) return accountAddress;

  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: entryPoint.abi,
    client,
  });

  const initCode = await getAccountInitCode();
  Logger.verbose("[BaseSmartContractAccount](getAddress) initCode: ", initCode);

  try {
    await entryPointContract.simulate.getSenderAddress([initCode]);
  } catch (err: any) {
    Logger.verbose(
      "[BaseSmartContractAccount](getAddress) getSenderAddress err: ",
      err
    );
    if (err.cause?.data?.errorName === "SenderAddressResult") {
      Logger.verbose(
        "[BaseSmartContractAccount](getAddress) entryPoint.getSenderAddress result:",
        err.cause.data.args[0]
      );

      return err.cause.data.args[0] as Address;
    }

    if (err.details === "Invalid URL") {
      throw new InvalidRpcUrlError();
    }
  }

  throw new GetCounterFactualAddressError();
};

// [!region toSmartContractAccount]
export async function toSmartContractAccount<
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>({
  transport,
  chain,
  entryPoint,
  source,
  accountAddress,
  getAccountInitCode,
  signMessage,
  signTypedData,
  encodeBatchExecute,
  encodeExecute,
  getDummySignature,
  signUserOperationHash,
  encodeUpgradeToAndCall,
}: ToSmartContractAccountParams<
  Name,
  TTransport,
  TChain,
  TEntryPointVersion
>): Promise<SmartContractAccount<Name, TEntryPointVersion>>;
// [!endregion toSmartContractAccount]

export async function toSmartContractAccount({
  transport,
  chain,
  entryPoint,
  source,
  accountAddress,
  getAccountInitCode,
  signMessage,
  signTypedData,
  encodeBatchExecute,
  encodeExecute,
  getDummySignature,
  signUserOperationHash,
  encodeUpgradeToAndCall,
}: ToSmartContractAccountParams): Promise<SmartContractAccount> {
  const client = createBundlerClient({
    // we set the retry count to 0 so that viem doesn't retry during
    // getting the address. That call always reverts and without this
    // viem will retry 3 times, making this call very slow
    transport: (opts) => transport({ ...opts, chain, retryCount: 0 }),
    chain,
  });

  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: entryPoint.abi,
    client,
  });

  const accountAddress_ = await getAccountAddress({
    client,
    entryPoint: entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  let deploymentState = DeploymentState.UNDEFINED;

  const getInitCode = async () => {
    if (deploymentState === DeploymentState.DEPLOYED) {
      return "0x";
    }

    const contractCode = await client.getBytecode({
      address: accountAddress_,
    });

    if ((contractCode?.length ?? 0) > 2) {
      deploymentState = DeploymentState.DEPLOYED;
      return "0x";
    } else {
      deploymentState = DeploymentState.NOT_DEPLOYED;
    }

    return getAccountInitCode();
  };

  const signUserOperationHash_ =
    signUserOperationHash ??
    (async (uoHash: Hex) => {
      return signMessage({ message: { raw: hexToBytes(uoHash) } });
    });

  const getFactoryAddress = async (): Promise<Address> =>
    parseFactoryAddressFromAccountInitCode(await getAccountInitCode())[0];

  const getFactoryData = async (): Promise<Hex> =>
    parseFactoryAddressFromAccountInitCode(await getAccountInitCode())[1];

  const encodeUpgradeToAndCall_ =
    encodeUpgradeToAndCall ??
    (() => {
      throw new UpgradesNotSupportedError(source);
    });

  const isAccountDeployed = async () => {
    const initCode = await getInitCode();
    return initCode === "0x";
  };

  const getNonce = async (nonceKey = 0n): Promise<bigint> => {
    if (!(await isAccountDeployed())) {
      return 0n;
    }

    return entryPointContract.read.getNonce([
      accountAddress_,
      nonceKey,
    ]) as Promise<bigint>;
  };

  const account = toAccount({
    address: accountAddress_,
    signMessage,
    signTypedData,
    signTransaction: () => {
      throw new SignTransactionNotSupportedError();
    },
  });

  const create6492Signature = async (isDeployed: boolean, signature: Hex) => {
    if (isDeployed) {
      return signature;
    }

    const [factoryAddress, factoryCalldata] =
      parseFactoryAddressFromAccountInitCode(await getAccountInitCode());

    return wrapSignatureWith6492({
      factoryAddress,
      factoryCalldata,
      signature,
    });
  };

  const signMessageWith6492 = async (message: { message: SignableMessage }) => {
    const [isDeployed, signature] = await Promise.all([
      isAccountDeployed(),
      account.signMessage(message),
    ]);

    return create6492Signature(isDeployed, signature);
  };

  const signTypedDataWith6492 = async <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>
  ): Promise<Hex> => {
    const [isDeployed, signature] = await Promise.all([
      isAccountDeployed(),
      account.signTypedData(typedDataDefinition),
    ]);

    return create6492Signature(isDeployed, signature);
  };

  const getImplementationAddress = async (): Promise<NullAddress | Address> => {
    const storage = await client.getStorageAt({
      address: account.address,
      // This is the default slot for the implementation address for Proxies
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

    if (storage == null) {
      throw new FailedToGetStorageSlotError(
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        "Proxy Implementation Address"
      );
    }

    return trim(storage);
  };

  if (entryPoint.version !== "0.6.0" && entryPoint.version !== "0.7.0") {
    throw new InvalidEntryPointError(chain, entryPoint.version);
  }

  return {
    ...account,
    source,
    // TODO: I think this should probably be signUserOperation instead
    // and allow for generating the UO hash based on the EP version
    signUserOperationHash: signUserOperationHash_,
    getFactoryAddress,
    getFactoryData,
    encodeBatchExecute:
      encodeBatchExecute ??
      (() => {
        throw new BatchExecutionNotSupportedError(source);
      }),
    encodeExecute,
    getDummySignature,
    getInitCode,
    encodeUpgradeToAndCall: encodeUpgradeToAndCall_,
    getEntryPoint: () => entryPoint,
    isAccountDeployed,
    getNonce,
    signMessageWith6492,
    signTypedDataWith6492,
    getImplementationAddress,
  };
}

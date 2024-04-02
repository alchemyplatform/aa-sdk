import {
  getContract,
  hexToBytes,
  toHex,
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
import { getEntryPoint } from "../entrypoint/index.js";
import type {
  DefaultEntryPointVersion,
  EntryPointDef,
  EntryPointParameter,
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

export type GetAccountParameter<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined,
  TAccountOverride extends SmartContractAccount<TEntryPointVersion> = SmartContractAccount<TEntryPointVersion>
> = IsUndefined<TAccount> extends true
  ? { account: TAccountOverride }
  : { account?: TAccountOverride };

export type UpgradeToAndCallParams = {
  upgradeToAddress: Address;
  upgradeToInitData: Hex;
};

export type SmartContractAccountWithSigner<
  TEntryPointVersion extends EntryPointVersion,
  Name extends string = string,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccount<TEntryPointVersion, Name> & {
  getSigner: () => TSigner;
};

//#region SmartContractAccount
export type SmartContractAccount<
  TEntryPointVersion extends EntryPointVersion,
  Name extends string = string
> = LocalAccount<Name> & {
  source: Name;
  getDummySignature: () => Hex;
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
  getFactoryAddress: () => Address;
  getEntryPoint: () => EntryPointDef<TEntryPointVersion>;
  getImplementationAddress: () => Promise<NullAddress | Address>;
};
//#endregion SmartContractAccount

export interface SmartAccountRegistry<Name extends string = string>
  extends EntryPointRegistryBase<
    SmartContractAccount<EntryPointVersion, Name>
  > {
  "0.6.0": SmartContractAccount<"0.6.0", Name>;
  "0.7.0": SmartContractAccount<"0.7.0", Name>;
}

export type ToSmartContractAccountParams<
  TEntryPointVersion extends EntryPointVersion,
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
> = {
  source: Name;
  transport: TTransport;
  chain: TChain;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
  getDummySignature: () => Hex;
  encodeExecute: (tx: AccountOp) => Promise<Hex>;
  encodeBatchExecute?: (txs: AccountOp[]) => Promise<Hex>;
  // if not provided, will default to just using signMessage over the Hex
  signUserOperationHash?: (uoHash: Hex) => Promise<Hex>;
  encodeUpgradeToAndCall?: (params: UpgradeToAndCallParams) => Promise<Hex>;
} & EntryPointParameter<TEntryPointVersion, TChain> &
  Omit<CustomSource, "signTransaction" | "address">;

export const parseFactoryAddressFromAccountInitCode = (initCode: Hex) => {
  const factoryAddress = `0x${initCode.substring(2, 42)}` as Address;
  const factoryCalldata = `0x${initCode.substring(42)}` as Hex;
  return [factoryAddress, factoryCalldata];
};

export const getAccountAddress = async ({
  client,
  entryPoint,
  accountAddress,
  getAccountInitCode,
}: {
  client: PublicClient;
  entryPoint: EntryPointDef<EntryPointVersion>;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
}) => {
  if (accountAddress) return accountAddress;

  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: entryPoint.abi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
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

export async function toSmartContractAccount<
  TEntryPointVersion extends DefaultEntryPointVersion = DefaultEntryPointVersion,
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
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
  TEntryPointVersion,
  Name,
  TTransport,
  TChain
>): Promise<SmartAccountRegistry<Name>[DefaultEntryPointVersion]>;

export async function toSmartContractAccount<
  TEntryPointDef extends EntryPointDef<TEntryPointVersion>,
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef["version"],
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
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
  TEntryPointVersion,
  Name,
  TTransport,
  TChain
>): Promise<SmartAccountRegistry<Name>[TEntryPointVersion]>;

export async function toSmartContractAccount<
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
>({
  chain,
  entryPoint,
  ...params
}: ToSmartContractAccountParams<
  EntryPointVersion,
  Name,
  TTransport,
  TChain
>): Promise<SmartAccountRegistry<Name>[EntryPointVersion]> {
  const _entryPoint: EntryPointDef<EntryPointVersion> =
    entryPoint ?? getEntryPoint(chain);

  switch (_entryPoint.version) {
    case "0.6.0":
      return _toSmartContractAccount<"0.6.0", Name, TTransport, TChain>({
        chain,
        entryPoint: _entryPoint as EntryPointDef<"0.6.0">,
        ...params,
      });
    case "0.7.0":
      return _toSmartContractAccount<"0.7.0", Name, TTransport, TChain>({
        chain,
        entryPoint: _entryPoint as EntryPointDef<"0.7.0">,
        ...params,
      });
    default:
      throw new InvalidEntryPointError(chain, _entryPoint.version);
  }
}

async function _toSmartContractAccount<
  TEntryPointVersion extends EntryPointVersion,
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
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
}: Omit<
  ToSmartContractAccountParams<EntryPointVersion, Name, TTransport, TChain>,
  "entryPoint"
> & { entryPoint: EntryPointDef<TEntryPointVersion> }): Promise<
  SmartAccountRegistry<Name>[EntryPointVersion]
> {
  const client = createBundlerClient<TEntryPointVersion, TTransport>({
    transport,
    chain,
  });

  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: entryPoint.abi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
  });

  const accountAddress_ = await getAccountAddress({
    client,
    entryPoint,
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

  const [factoryAddress] = parseFactoryAddressFromAccountInitCode(
    await getAccountInitCode()
  );

  const getFactoryAddress = () => factoryAddress;

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

    return toHex(trim(storage));
  };

  return {
    ...account,
    source,
    // TODO: I think this should probably be signUserOperation instead
    // and allow for generating the UO hash based on the EP version
    signUserOperationHash: signUserOperationHash_,
    getFactoryAddress,
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
  } as SmartAccountRegistry<Name>[TEntryPointVersion];
}

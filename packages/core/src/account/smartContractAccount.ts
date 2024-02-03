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
import { EntryPointAbi } from "../abis/EntryPointAbi.js";
import { createBundlerClient } from "../client/bundlerClient.js";
import {
  BatchExecutionNotSupportedError,
  FailedToGetStorageSlotError,
  GetCounterFactualAddressError,
  SignTransactionNotSupportedError,
  UpgradesNotSupportedError,
} from "../errors/account.js";
import { InvalidRpcUrlError } from "../errors/client.js";
import { Logger } from "../logger.js";
import type { SmartAccountSigner } from "../signer/types.js";
import { wrapSignatureWith6492 } from "../signer/utils.js";
import type { IsUndefined } from "../utils/types.js";
import { DeploymentState } from "./base.js";

type Tx = {
  target: Address;
  value?: bigint;
  data: Hex | "0x";
};

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

export type OwnedSmartContractAccount<
  Name extends string = string,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccount<Name> & {
  getOwner: () => TOwner;
  setOwner: (owner: TOwner) => void;
};

export type SmartContractAccount<Name extends string = string> =
  LocalAccount<Name> & {
    source: Name;
    getDummySignature: () => Hex;
    encodeExecute: (tx: Tx) => Promise<Hex>;
    encodeBatchExecute: (txs: Tx[]) => Promise<Hex>;
    signUserOperationHash: (uoHash: Hex) => Promise<Hex>;
    signMessageWith6492: (params: { message: SignableMessage }) => Promise<Hex>;
    signTypedDataWith6492: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ) => Promise<Hex>;
    encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;
    getNonce(): Promise<bigint>;
    getInitCode: () => Promise<Hex>;
    isAccountDeployed: () => Promise<boolean>;
    getFactoryAddress: () => Address;
    getEntrypoint: () => Address;
    getImplementationAddress: () => Promise<"0x0" | Address>;
  };

export type ToSmartContractAccountParams<
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
> = {
  source: Name;
  transport: TTransport;
  chain: TChain;
  // TODO: we may want to revisit this so that it's an object
  // which includes the EP version and its UO hashing algo
  entrypointAddress: Address;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
  getDummySignature: () => Hex;
  encodeExecute: (tx: Tx) => Promise<Hex>;
  encodeBatchExecute?: (txs: Tx[]) => Promise<Hex>;
  // if not provided, will default to just using signMessage over the Hex
  signUserOperationHash?: (uoHash: Hex) => Promise<Hex>;
  encodeUpgradeToAndCall?: (params: UpgradeToAndCallParams) => Promise<Hex>;
} & Omit<CustomSource, "signTransaction" | "address">;

export const parseFactoryAddressFromAccountInitCode = (initCode: Hex) => {
  const factoryAddress = `0x${initCode.substring(2, 42)}` as Address;
  const factoryCalldata = `0x${initCode.substring(42)}` as Hex;
  return [factoryAddress, factoryCalldata];
};

export const getAccountAddress = async ({
  client,
  entrypointAddress,
  accountAddress,
  getAccountInitCode,
}: {
  client: PublicClient;
  entrypointAddress: Address;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
}) => {
  if (accountAddress) return accountAddress;

  const entrypoint = getContract({
    address: entrypointAddress,
    abi: EntryPointAbi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
  });

  const initCode = await getAccountInitCode();
  Logger.verbose("[BaseSmartContractAccount](getAddress) initCode: ", initCode);

  try {
    await entrypoint.simulate.getSenderAddress([initCode]);
  } catch (err: any) {
    Logger.verbose(
      "[BaseSmartContractAccount](getAddress) getSenderAddress err: ",
      err
    );
    if (err.cause?.data?.errorName === "SenderAddressResult") {
      Logger.verbose(
        "[BaseSmartContractAccount](getAddress) entrypoint.getSenderAddress result:",
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
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
>({
  transport,
  chain,
  source,
  entrypointAddress,
  accountAddress,
  getAccountInitCode,
  signMessage,
  signTypedData,
  encodeBatchExecute,
  encodeExecute,
  getDummySignature,
  signUserOperationHash,
  encodeUpgradeToAndCall,
}: ToSmartContractAccountParams<Name, TTransport, TChain>): Promise<
  SmartContractAccount<Name>
> {
  const client = createBundlerClient({
    transport,
    chain,
  });
  const entrypoint = getContract({
    address: entrypointAddress,
    abi: EntryPointAbi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
  });

  const accountAddress_ = await getAccountAddress({
    client,
    entrypointAddress,
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

  const getNonce = async () => {
    if (!(await isAccountDeployed())) {
      return 0n;
    }

    return entrypoint.read.getNonce([accountAddress_, BigInt(0)]);
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

  const getImplementationAddress = async (): Promise<"0x0" | Address> => {
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
    // TODO: I think think in the future this needs to return an object
    getEntrypoint: () => entrypointAddress,
    isAccountDeployed,
    getNonce,
    signMessageWith6492,
    signTypedDataWith6492,
    getImplementationAddress,
  };
}

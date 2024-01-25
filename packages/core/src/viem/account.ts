import {
  getContract,
  type Address,
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
import { DeploymentState } from "../account/base.js";
import type { PublicErc4337Client } from "../client/types.js";
import { wrapSignatureWith6492 } from "../signer/utils.js";
import type { IsUndefined } from "../utils/types.js";

type Tx = {
  target: Address;
  value?: bigint;
  data: Hex | "0x";
};

export type GetAccountParameter<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = IsUndefined<TAccount> extends true
  ? { account: SmartContractAccount }
  : { account?: SmartContractAccount };

export type UpgradeToAndCallParams = {
  upgradeToAddress: Address;
  upgradeToInitData: Hex;
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
      const TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string
    >(
      typedData: TypedDataDefinition<TTypedData, TPrimaryType>
    ) => Promise<Hex>;
    encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;
    getNonce(): Promise<bigint>;
    getInitCode: () => Promise<Hex>;
    isAccountDeployed: () => Promise<boolean>;
    getFactoryAddress: () => Address;
    getEntrypoint: () => Address;
  };

export type ToSmartContractAccountParams<
  Name extends string = string,
  TTransport extends Transport = Transport,
  client extends PublicErc4337Client<TTransport> = PublicErc4337Client<TTransport>
> = {
  source: Name;
  client: client;
  // TODO: we may want to revisit this so that it's an object
  // which includes the EP version and its UO hashing algo
  entrypointAddress: Address;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
  getDummySignature: () => Hex;
  encodeExecute: (tx: Tx) => Promise<Hex>;
  encodeBatchExecute: (txs: Tx[]) => Promise<Hex>;
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
    publicClient: client as PublicClient,
  });

  const initCode = await getAccountInitCode();
  try {
    await entrypoint.simulate.getSenderAddress([initCode]);
  } catch (err: any) {
    if (err.cause?.data?.errorName === "SenderAddressResult") {
      return err.cause.data.args[0] as Address;
    }

    if (err.details === "Invalid URL") {
      throw new Error("Invalid RPC URL.");
    }
  }

  throw new Error("getCounterFactualAddress failed");
};

export const toSmartContractAccount = async <
  Name extends string = string,
  TTransport extends Transport = Transport
>({
  client,
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
}: ToSmartContractAccountParams<Name, TTransport>): Promise<
  SmartContractAccount<Name>
> => {
  const entrypoint = getContract({
    address: entrypointAddress,
    abi: EntryPointAbi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    publicClient: client as PublicClient,
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
      return signMessage({ message: { raw: uoHash } });
    });

  const [factoryAddress] = parseFactoryAddressFromAccountInitCode(
    await getAccountInitCode()
  );

  const getFactoryAddress = () => factoryAddress;

  const encodeUpgradeToAndCall_ =
    encodeUpgradeToAndCall ??
    (() => {
      throw new Error("contract does not support upgrades");
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
      throw new Error("Sign Transaction not supported for smart contracts");
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
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    typedData: TypedDataDefinition<TTypedData, TPrimaryType>
  ): Promise<Hex> => {
    const [isDeployed, signature] = await Promise.all([
      isAccountDeployed(),
      account.signTypedData(typedData),
    ]);

    return create6492Signature(isDeployed, signature);
  };

  return {
    ...account,
    source,
    // TODO: I think this should probably be signUserOperation instead
    // and allow for generating the UO hash based on the EP version
    signUserOperationHash: signUserOperationHash_,
    getFactoryAddress,
    encodeBatchExecute,
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
  };
};

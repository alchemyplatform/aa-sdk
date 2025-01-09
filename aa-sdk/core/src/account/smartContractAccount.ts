import {
  getContract,
  hexToBytes,
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

export type AccountOp = {
  target: Address;
  value?: bigint;
  data: Hex | "0x";
};

export enum DeploymentState {
  UNDEFINED = "0x0",
  NOT_DEPLOYED = "0x1",
  DEPLOYED = "0x2",
}

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

/**
 * Determines if the given SmartContractAccount has a signer associated with it.
 *
 * @example
 * ```ts
 * import { toSmartContractAccount } from "@aa-sdk/core";
 *
 * const account = await toSmartContractAccount(...);
 *
 * console.log(isSmartAccountWithSigner(account)); // false: the base account does not have a publicly accessible signer
 * ```
 *
 * @param {SmartContractAccount} account The account to check.
 * @returns {boolean} true if the account has a signer, otherwise false.
 */
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
  getAccountNonce(nonceKey?: bigint): Promise<bigint>;
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
} & Omit<
  CustomSource,
  "signTransaction" | "address" | "experimental_signAuthorization"
>;
// [!endregion ToSmartContractAccountParams]

/**
 * Parses the factory address and factory calldata from the provided account initialization code (initCode).
 *
 * @example
 * ```ts
 * import { parseFactoryAddressFromAccountInitCode } from "@aa-sdk/core";
 *
 * const [address, calldata] = parseFactoryAddressFromAccountInitCode("0xAddressCalldata");
 * ```
 *
 * @param {Hex} initCode The initialization code from which to parse the factory address and calldata
 * @returns {[Address, Hex]} A tuple containing the parsed factory address and factory calldata
 */
export const parseFactoryAddressFromAccountInitCode = (
  initCode: Hex
): [Address, Hex] => {
  const factoryAddress: Address = `0x${initCode.substring(2, 42)}`;
  const factoryCalldata: Hex = `0x${initCode.substring(42)}`;
  return [factoryAddress, factoryCalldata];
};

export type GetAccountAddressParams = {
  client: PublicClient;
  entryPoint: EntryPointDef;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
};

/**
 * Retrieves the account address. Uses a provided `accountAddress` if available; otherwise, it computes the address using the entry point contract and the initial code.
 *
 * @example
 * ```ts
 * import { getEntryPoint, getAccountAddress } from "@aa-sdk/core";
 *
 * const accountAddress = await getAccountAddress({
 *  client,
 *  entryPoint: getEntryPoint(chain),
 *  getAccountInitCode: async () => "0x{factoryAddress}{factoryCallData}",
 * });
 * ```
 *
 * @param {GetAccountAddressParams} params The configuration object
 * @param {PublicClient} params.client A public client instance to interact with the blockchain
 * @param {EntryPointDef} params.entryPoint The entry point definition which includes the address and ABI
 * @param {Address} params.accountAddress Optional existing account address
 * @param {() => Promise<Hex>} params.getAccountInitCode A function that returns a Promise resolving to a Hex string representing the initial code of the account
 * @returns {Promise<Address>} A promise that resolves to the account address
 */
export const getAccountAddress = async ({
  client,
  entryPoint,
  accountAddress,
  getAccountInitCode,
}: GetAccountAddressParams) => {
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

/**
 * Converts an account to a smart contract account and sets up various account-related methods using the provided parameters like transport, chain, entry point, and other utilities.
 *
 * @example
 * ```ts
 * import { http, type SignableMessage } from "viem";
 * import { sepolia } from "viem/chains";
 *
 * const myAccount = await toSmartContractAccount({
 *  /// REQUIRED PARAMS ///
 *  source: "MyAccount",
 *  transport: http("RPC_URL"),
 *  chain: sepolia,
 *  // The EntryPointDef that your account is com"patible with
 *  entryPoint: getEntryPoint(sepolia, { version: "0.6.0" }),
 *  // This should return a concatenation of your `factoryAddress` and the `callData` for your factory's create account method
 *  getAccountInitCode: async () => "0x{factoryAddress}{callData}",
 *  // an invalid signature that doesn't cause your account to revert during validation
 *  getDummySignature: () => "0x1234...",
 *  // given a UO in the form of {target, data, value} should output the calldata for calling your contract's execution method
 *  encodeExecute: async (uo) => "0xcalldata",
 *  signMessage: async ({ message }: { message: SignableMessage }) => "0x...",
 *  signTypedData: async (typedData) => "0x000",
 *
 *  /// OPTIONAL PARAMS ///
 *  // if you already know your account's address, pass that in here to avoid generating a new counterfactual
 *  accountAddress: "0xaddressoverride",
 *  // if your account supports batching, this should take an array of UOs and return the calldata for calling your contract's batchExecute method
 *  encodeBatchExecute: async (uos) => "0x...",
 *  // if your contract expects a different signing scheme than the default signMessage scheme, you can override that here
 *  signUserOperationHash: async (hash) => "0x...",
 *  // allows you to define the calldata for upgrading your account
 *  encodeUpgradeToAndCall: async (params) => "0x...",
 * });
 * ```
 *
 * @param {ToSmartContractAccountParams} params the parameters required for converting to a smart contract account
 * @param {Transport} params.transport the transport mechanism used for communication
 * @param {Chain} params.chain the blockchain chain used in the account
 * @param {EntryPoint} params.entryPoint the entry point of the smart contract
 * @param {string} params.source the source identifier for the account
 * @param {Address} [params.accountAddress] the address of the account
 * @param {() => Promise<Hex>} params.getAccountInitCode a function to get the initial state code of the account
 * @param {(message: { message: SignableMessage }) => Promise<Hex>} params.signMessage a function to sign a message
 * @param {(typedDataDefinition: TypedDataDefinition<typedData, primaryType>) => Promise<Hex>} params.signTypedData a function to sign typed data
 * @param {(transactions: Transaction[]) => Hex} [params.encodeBatchExecute] a function to encode batch transactions
 * @param {(tx: Transaction) => Hex} params.encodeExecute a function to encode a single transaction
 * @param {() => Promise<Hex>} params.getDummySignature a function to get a dummy signature
 * @param {(uoHash: Hex) => Promise<Hex>} [params.signUserOperationHash] a function to sign user operations
 * @param {(implementationAddress: Address, implementationCallData: Hex) => Hex} [params.encodeUpgradeToAndCall] a function to encode upgrade call
 * @returns {Promise<SmartContractAccount>} a promise that resolves to a SmartContractAccount object with methods and properties for interacting with the smart contract account
 */
export async function toSmartContractAccount(
  params: ToSmartContractAccountParams
): Promise<SmartContractAccount> {
  const {
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
  } = params;

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
    const contractCode = await client.getCode({
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

    // The storage slot contains a full bytes32, but we want only the last 20 bytes.
    // So, slice off the leading `0x` and the first 12 bytes (24 characters), leaving the last 20 bytes, then prefix with `0x`.
    return `0x${storage.slice(26)}`;
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
    getAccountNonce: getNonce,
    signMessageWith6492,
    signTypedDataWith6492,
    getImplementationAddress,
  };
}

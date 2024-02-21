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
import { getVersion060EntryPoint } from "../entrypoint/0.6.js";
import type { EntryPointDef } from "../entrypoint/types.js";
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
import type { UserOperationRequest } from "../types.js";
import type { IsUndefined } from "../utils/types.js";
import { DeploymentState } from "./base.js";

export type AccountOp = {
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

// @param upgradeToAddress -- the implementation address of the contract you want to upgrade to
// @param upgradeToInitData -- the initialization data required by that account
export type UpgradeToAndCallParams = {
  upgradeToAddress: Address;
  upgradeToInitData: Hex;
};

export type SmartContractAccountWithSigner<
  Name extends string = string,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccount<Name> & {
  getSigner: () => TSigner;
};

export type SmartContractAccount<
  Name extends string = string,
  TUO = UserOperationRequest
> = LocalAccount<Name> & {
  source: Name;

  /**
   * This is useful for estimating gas costs. It should return a signature that doesn't cause the account to revert
   * when validation is run during estimation.
   *
   * @returns a dummy signature that doesn't cause the account to revert during estimation
   */
  getDummySignature: () => Hex;

  /**
   * Encodes a call to the account's execute function.
   *
   * @param target - the address receiving the call data
   * @param value - optionally the amount of native token to send
   * @param data - the call data or "0x" if empty
   */
  encodeExecute: (tx: AccountOp) => Promise<Hex>;

  /**
   * Encodes a batch of transactions to the account's batch execute function.
   * NOTE: not all accounts support batching.
   * @param txs - An Array of objects containing the target, value, and data for each transaction
   * @returns the encoded callData for a UserOperation
   */
  encodeBatchExecute: (txs: AccountOp[]) => Promise<Hex>;

  /**
   * If your account handles 1271 signatures of personal_sign differently
   * than it does UserOperations, you can implement two different approaches to signing
   *
   * @param uoHash -- The hash of the UserOperation to sign
   * @returns the signature of the UserOperation
   */
  signUserOperationHash: (uoHash: Hex) => Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the message and then wrap it in 6492 format
   *
   * @param msg - the message to sign
   * @returns ths signature wrapped in 6492 format
   */
  signMessageWith6492: (params: { message: SignableMessage }) => Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the typed data blob and then wrap it in 6492 format
   *
   * @param params - {@link SignTypedDataParams}
   * @returns the signed hash for the params passed in wrapped in 6492 format
   */
  signTypedDataWith6492: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>
  ) => Promise<Hex>;

  /**
   * If your contract supports UUPS, you can implement this method which can be
   * used to upgrade the implementation of the account.
   *
   * @param params -- the UpgradeToAndCallParams for the account to upgrade to
   */
  encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;

  /**
   * The optional nonceKey param is used when calling `entryPoint.getNonce`
   * It is useful when you want to use parallel nonces for user operations
   *
   * NOTE: not all bundlers fully support this feature and it could be that your bundler will still only include
   * one user operation for your account in a bundle
   *
   * @param nonceKey -- the nonce key to use parallel nonces for user operations
   * @returns the nonce of the account from entry point contract
   */
  getNonce(nonceKey?: bigint): Promise<bigint>;

  /**
   * @returns the init code for the account
   */
  getInitCode: () => Promise<Hex>;

  /**
   * @returns the boolean whether the account has been created on-chain
   */
  isAccountDeployed: () => Promise<boolean>;

  /**
   * @returns the address of the factory contract for the smart account
   */
  getFactoryAddress: () => Address;

  /**
   * @returns the entry point contract def for the smart account
   */
  getEntryPoint: () => EntryPointDef<TUO>;

  /**
   * @returns the implementation contract address of the smart account
   */
  getImplementationAddress: () => Promise<"0x0" | Address>;
};

export type ToSmartContractAccountParams<
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TUserOperationRequest = UserOperationRequest
> = {
  source: Name;
  transport: TTransport;
  chain: TChain;
  entryPoint?: EntryPointDef<TUserOperationRequest>;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
  getDummySignature: () => Hex;
  encodeExecute: (tx: AccountOp) => Promise<Hex>;
  encodeBatchExecute?: (txs: AccountOp[]) => Promise<Hex>;
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
  entryPointAddress,
  accountAddress,
  getAccountInitCode,
}: {
  client: PublicClient;
  entryPointAddress: Address;
  accountAddress?: Address;
  getAccountInitCode: () => Promise<Hex>;
}) => {
  if (accountAddress) return accountAddress;

  const entryPoint = getContract({
    address: entryPointAddress,
    abi: EntryPointAbi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
  });

  const initCode = await getAccountInitCode();
  Logger.verbose("[BaseSmartContractAccount](getAddress) initCode: ", initCode);

  try {
    await entryPoint.simulate.getSenderAddress([initCode]);
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
  Name extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
>({
  transport,
  chain,
  source,
  entryPoint = getVersion060EntryPoint(chain),
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
  const entryPointContract = getContract({
    address: entryPoint.address,
    abi: EntryPointAbi,
    // Need to cast this as PublicClient or else it breaks ABI typing.
    // This is valid because our PublicClient is a subclass of PublicClient
    client: client as PublicClient,
  });

  const accountAddress_ = await getAccountAddress({
    client,
    entryPointAddress: entryPoint.address,
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

  const getNonce = async (nonceKey = 0n) => {
    if (!(await isAccountDeployed())) {
      return 0n;
    }

    return entryPointContract.read.getNonce([accountAddress_, nonceKey]);
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
    getEntryPoint: () => entryPoint,
    isAccountDeployed,
    getNonce,
    signMessageWith6492,
    signTypedDataWith6492,
    getImplementationAddress,
  };
}

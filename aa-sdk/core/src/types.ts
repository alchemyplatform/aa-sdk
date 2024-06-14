import {
  type Address,
  type Hash,
  type Hex,
  type StateOverride,
  type TransactionReceipt,
} from "viem";
import type { z } from "zod";
import type {
  UserOperationFeeOptionsFieldSchema,
  UserOperationFeeOptionsSchema,
  UserOperationFeeOptionsSchema_v6,
  UserOperationFeeOptionsSchema_v7,
} from "./client/schema";
import type { EntryPointVersion } from "./entrypoint/types";
import type {
  BigNumberishRangeSchema,
  BigNumberishSchema,
  MultiplierSchema,
  NoUndefined,
} from "./utils";

export type EmptyHex = `0x`;
export type NullAddress = `0x0`;

// based on @account-abstraction/common
export type PromiseOrValue<T> = T | Promise<T>;
export type BytesLike = Uint8Array | Hex;
export type Multiplier = z.input<typeof MultiplierSchema>;

export type BigNumberish = z.input<typeof BigNumberishSchema>;
export type BigNumberishRange = z.input<typeof BigNumberishRangeSchema>;

// [!region UserOperationCallData]
export type UserOperationCallData =
  | {
      /* the target of the call */
      target: Address;
      /* the data passed to the target */
      data: Hex;
      /* the amount of native token to send to the target (default: 0) */
      value?: bigint;
    }
  | Hex;
// [!endregion UserOperationCallData]

// [!region BatchUserOperationCallData]
export type BatchUserOperationCallData = Exclude<UserOperationCallData, Hex>[];
// [!endregion BatchUserOperationCallData]

export type UserOperationFeeOptionsField = z.input<
  typeof UserOperationFeeOptionsFieldSchema
>;

export type UserOperationFeeOptions<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? z.input<typeof UserOperationFeeOptionsSchema_v6>
  : TEntryPointVersion extends "0.7.0"
  ? z.input<typeof UserOperationFeeOptionsSchema_v7>
  : z.input<typeof UserOperationFeeOptionsSchema>;

export type UserOperationOverridesParameter<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
  Required extends boolean = false
> = Required extends true
  ? { overrides: UserOperationOverrides<TEntryPointVersion> }
  : { overrides?: UserOperationOverrides<TEntryPointVersion> };

// [!region UserOperationPaymasterOverrides]
export type UserOperationPaymasterOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? {
      // paymasterData overrides to bypass paymaster middleware
      paymasterAndData: Hex;
    }
  : TEntryPointVersion extends "0.7.0"
  ? {
      // paymasterData overrides to bypass paymaster middleware
      // if set to '0x', all paymaster related fields are omitted from the user op request
      paymasterData: Hex;
      paymaster: Address;
      paymasterVerificationGasLimit:
        | NoUndefined<
            UserOperationStruct<"0.7.0">["paymasterVerificationGasLimit"]
          >
        | Multiplier;
      paymasterPostOpGasLimit:
        | NoUndefined<UserOperationStruct<"0.7.0">["paymasterPostOpGasLimit"]>
        | Multiplier;
    }
  : {};
// [!endregion UserOperationOverridesParameter]

// [!region UserOperationOverrides]
export type UserOperationOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = Partial<
  {
    callGasLimit:
      | UserOperationStruct<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    maxFeePerGas:
      | UserOperationStruct<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | UserOperationStruct<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
    preVerificationGas:
      | UserOperationStruct<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
    verificationGasLimit:
      | UserOperationStruct<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    /**
     * This can be used to override the key used when calling `entryPoint.getNonce`
     * It is useful when you want to use parallel nonces for user operations
     *
     * NOTE: not all bundlers fully support this feature and it could be that your bundler will still only include
     * one user operation for your account in a bundle
     */
    nonceKey: bigint;

    /**
     * The same state overrides for
     * [`eth_call`](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-eth#eth-call) method.
     * An address-to-state mapping, where each entry specifies some state to be ephemerally overridden
     * prior to executing the call. State overrides allow you to customize the network state for
     * the purpose of the simulation, so this feature is useful when you need to estimate gas
     * for user operation scenarios under conditions that aren’t currently present on the live network.
     */
    stateOverride: StateOverride;
  } & UserOperationPaymasterOverrides<TEntryPointVersion>
>;
// [!endregion UserOperationOverrides]

// [!region UserOperationRequest_v6]
// represents the request as it needs to be formatted for v0.6 RPC requests
// Reference: https://github.com/ethereum/ERCs/blob/8dd085d159cb123f545c272c0d871a5339550e79/ERCS/erc-4337.md#definitions
export interface UserOperationRequest_v6 {
  /* the origin of the request */
  sender: Address;
  /* nonce (as hex) of the transaction, returned from the entry point for this Address */
  nonce: Hex;
  /* the initCode for creating the sender if it does not exist yet, otherwise "0x" */
  initCode: Hex | EmptyHex;
  /* the callData passed to the target */
  callData: Hex;
  /* Gas value (as hex) used by inner account execution */
  callGasLimit: Hex;
  /* Actual gas (as hex) used by the validation of this UserOperation */
  verificationGasLimit: Hex;
  /* Gas overhead (as hex) of this UserOperation */
  preVerificationGas: Hex;
  /* Maximum fee per gas (similar to EIP-1559 max_fee_per_gas) (as hex)*/
  maxFeePerGas: Hex;
  /* Maximum priority fee per gas (similar to EIP-1559 max_priority_fee_per_gas) (as hex)*/
  maxPriorityFeePerGas: Hex;
  /* Address of paymaster sponsoring the transaction, followed by extra data to send to the paymaster ("0x" for self-sponsored transaction) */
  paymasterAndData: Hex | EmptyHex;
  /* Data passed into the account along with the nonce during the verification step */
  signature: Hex;
}
// [!endregion UserOperationRequest_v6]

// [!region UserOperationRequest_v7]
// represents the request as it needs to be formatted for v0.7 RPC requests
// Reference: https://eips.ethereum.org/EIPS/eip-4337#definitions
export interface UserOperationRequest_v7 {
  /* the account making the operation */
  sender: Address;
  /* anti-replay parameter. nonce of the transaction, returned from the entry point for this address */
  nonce: Hex;
  /* account factory, only for new accounts */
  factory?: Address;
  /* data for account factory (only if account factory exists) */
  factoryData?: Hex;
  /* the data to pass to the sender during the main execution call */
  callData: Hex;
  /* the amount of gas to allocate the main execution call */
  callGasLimit: Hex;
  /* the amount of gas to allocate for the verification step */
  verificationGasLimit: Hex;
  /* extra gas to pay the bunder */
  preVerificationGas: Hex;
  /* maximum fee per gas (similar to EIP-1559 max_fee_per_gas) */
  maxFeePerGas: Hex;
  /* maximum priority fee per gas (similar to EIP-1559 max_priority_fee_per_gas) */
  maxPriorityFeePerGas: Hex;
  /* address of paymaster contract, (or empty, if account pays for itself) */
  paymaster?: Address;
  /* the amount of gas to allocate for the paymaster validation code */
  paymasterVerificationGasLimit?: Hex;
  /* the amount of gas to allocate for the paymaster post-operation code */
  paymasterPostOpGasLimit?: Hex;
  /* data for paymaster (only if paymaster exists) */
  paymasterData?: Hex;
  /* data passed into the account to verify authorization */
  signature: Hex;
}
// [!endregion UserOperationRequest_v7]

// [!region UserOperationRequest]
// Reference: https://eips.ethereum.org/EIPS/eip-4337#definitions
export type UserOperationRequest<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? UserOperationRequest_v6
  : TEntryPointVersion extends "0.7.0"
  ? UserOperationRequest_v7
  : never;

// [!endregion UserOperationRequest]

// [!region UserOperationEstimateGasResponse]
export interface UserOperationEstimateGasResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> {
  /* Gas overhead of this UserOperation */
  preVerificationGas: BigNumberish;
  /* Actual gas used by the validation of this UserOperation */
  verificationGasLimit: BigNumberish;
  /* Value used by inner account execution */
  callGasLimit: BigNumberish;
  /*
   * EntryPoint v0.7.0 operations only.
   * The amount of gas to allocate for the paymaster validation code.
   * Note: `eth_estimateUserOperationGas` does not return paymasterPostOpGasLimit.
   */
  paymasterVerificationGasLimit: TEntryPointVersion extends "0.7.0"
    ? BigNumberish | undefined
    : never;
}
// [!endregion UserOperationEstimateGasResponse]

// [!region UserOperationResponse]
export interface UserOperationResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> {
  /* the User Operation */
  userOperation: UserOperationRequest<TEntryPointVersion>;
  /* the address of the entry point contract that executed the user operation */
  entryPoint: Address;
  /* the block number the user operation was included in */
  blockNumber: BigNumberish;
  /* the hash of the block the user operation was included in */
  blockHash: Hash;
  /* the hash of the transaction that included the user operation */
  transactionHash: Hash;
}
// [!endregion UserOperationResponse]

// [!region UserOperationReceipt]
export interface UserOperationReceipt {
  /* The request hash of the UserOperation. */
  userOpHash: Hash;
  /* The entry point address used for the UserOperation. */
  entryPoint: Address;
  /* The account initiating the UserOperation. */
  sender: Address;
  /* The nonce used in the UserOperation. */
  nonce: BigNumberish;
  /* The paymaster used for this UserOperation (or empty). */
  paymaster?: Address;
  /* The actual amount paid (by account or paymaster) for this UserOperation. */
  actualGasCost: BigNumberish;
  /* The total gas used by this UserOperation (including preVerification, creation, validation, and execution). */
  actualGasUsed: BigNumberish;
  /* Indicates whether the execution completed without reverting. */
  success: boolean;
  /* In case of revert, this is the revert reason. */
  reason?: string;
  /* The logs generated by this UserOperation (not including logs of other UserOperations in the same bundle). */
  logs: string[];
  /* The TransactionReceipt object for the entire bundle, not only for this UserOperation. */
  receipt: TransactionReceipt;
}
// [!endregion UserOperationReceipt]

/** @deprecated use viem type TransactionReceipt instead */
export interface UserOperationReceiptObject {
  /* 32 Bytes - hash of the block where this log was in. null when its pending. null when its pending log */
  blockHash: Hash;
  /* The block number where this log was in. null when its pending. null when its pending log. */
  blockNumber: BigNumberish;
  /* The index of the transaction within the block. */
  transactionIndex: BigNumberish;
  /* 32 Bytes - hash of the transaction. null when its pending. */
  transactionHash: Hash;
  /* 20 Bytes - address of the sender */
  from: Address;
  /* 20 Bytes - address of the receiver. null when its a contract creation transaction */
  to: Address;
  /* The total amount of gas used when this transaction was executed in the block. */
  cumulativeGasUsed: BigNumberish;
  /* The amount of gas used by this specific transaction alone */
  gasUsed: BigNumberish;
  /* 20 Bytes - The contract address created, if the transaction was a contract creation, otherwise null */
  contractAddress: Address;
  logs: UserOperationReceiptLog[];
  /* 256 Bytes - Bloom filter for light clients to quickly retrieve related logs */
  logsBloom: Hex;
  /* 32 bytes of post-transaction stateroot. (pre Byzantium hard fork at block 4,370,000) */
  root: Hex;
  /* Either 1 (success) or 0 (failure). (post Byzantium hard fork at block 4,370,000) */
  status: number;
  /* The cumulative gas used in the block containing this UserOperation. */
  effectiveGasPrice: BigNumberish;
  /* The type of the recipt object */
  type: string;
}

/** @deprecated use viem type Log instead */
/* https://github.com/wevm/viem/blob/6ef4ac131a878bf1dc4b335f5dc127e62618dda0/src/types/log.ts#L15 */
export interface UserOperationReceiptLog {
  /* The hash of the block where the given transaction was included. */
  blockHash: Hash;
  /* The number of the block where the given transaction was included. */
  blockNumber: BigNumberish;
  /* The index of the transaction within the block. */
  transactionIndex: BigNumberish;
  /* 20 Bytes - address from which this log originated. */
  address: Address;
  /* Integer of the log index position in the block. null when its pending log. */
  logIndex: BigNumberish;
  /* Contains one or more 32 Bytes non-indexed arguments of the log. */
  data: Hex;
  /* true when the log was removed, due to a chain reorganization. false if its a valid log. */
  removed: boolean;
  /* Array of zero to four 32 Bytes DATA of indexed log arguments. */
  topics: string[];
  /* hash of the transaction */
  transactionHash: Hash;
}

// [!region UserOperationStruct_v6]
// https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.6/test/UserOperation.ts
// this is used for building requests for v0.6 entry point contract
export interface UserOperationStruct_v6 {
  /* the origin of the request */
  sender: string;
  /* nonce of the transaction, returned from the entry point for this address */
  nonce: BigNumberish;
  /* the initCode for creating the sender if it does not exist yet, otherwise "0x" */
  initCode: BytesLike | "0x";
  /* the callData passed to the target */
  callData: BytesLike;
  /* Value used by inner account execution */
  callGasLimit?: BigNumberish;
  /* Actual gas used by the validation of this UserOperation */
  verificationGasLimit?: BigNumberish;
  /* Gas overhead of this UserOperation */
  preVerificationGas?: BigNumberish;
  /* Maximum fee per gas (similar to EIP-1559 max_fee_per_gas) */
  maxFeePerGas?: BigNumberish;
  /* Maximum priority fee per gas (similar to EIP-1559 max_priority_fee_per_gas) */
  maxPriorityFeePerGas?: BigNumberish;
  /* Address of paymaster sponsoring the transaction, followed by extra data to send to the paymaster ("0x" for self-sponsored transaction) */
  paymasterAndData: BytesLike | "0x";
  /* Data passed into the account along with the nonce during the verification step */
  signature: BytesLike;
}
// [!endregion UserOperationStruct_v6]

// [!region UserOperationStruct_v7]
// based on https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/test/UserOperation.ts
// this is used for building requests for v0.7 entry point contract
export interface UserOperationStruct_v7 {
  /* the account making the operation */
  sender: string;
  /* anti-replay parameter. nonce of the transaction, returned from the entry point for this address */
  nonce: BigNumberish;
  /* account factory, only for new accounts */
  factory?: string;
  /* data for account factory (only if account factory exists) */
  factoryData?: BytesLike;
  /* the data to pass to the sender during the main execution call */
  callData: BytesLike;
  /* the amount of gas to allocate the main execution call */
  callGasLimit?: BigNumberish;
  /* the amount of gas to allocate for the verification step */
  verificationGasLimit?: BigNumberish;
  /* extra gas to pay the bunder */
  preVerificationGas?: BigNumberish;
  /* maximum fee per gas (similar to EIP-1559 max_fee_per_gas) */
  maxFeePerGas?: BigNumberish;
  /* maximum priority fee per gas (similar to EIP-1559 max_priority_fee_per_gas) */
  maxPriorityFeePerGas?: BigNumberish;
  /* address of paymaster contract, (or empty, if account pays for itself) */
  paymaster?: string;
  /* the amount of gas to allocate for the paymaster validation code */
  paymasterVerificationGasLimit?: BigNumberish;
  /* the amount of gas to allocate for the paymaster post-operation code */
  paymasterPostOpGasLimit?: BigNumberish;
  /* data for paymaster (only if paymaster exists) */
  paymasterData?: BytesLike;
  /* data passed into the account to verify authorization */
  signature: BytesLike;
}
// [!endregion UserOperationStruct_v7]

// [!region UserOperationStruct]
export type UserOperationStruct<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? UserOperationStruct_v6
  : TEntryPointVersion extends "0.7.0"
  ? UserOperationStruct_v7
  : never;
// [!endregion UserOperationStruct]

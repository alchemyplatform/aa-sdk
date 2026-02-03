/**
 * Types for wallet API client and actions.
 *
 * The viem-native types use JS-native values (bigint, number) instead of hex strings.
 * The corresponding RPC/API types (with hex strings) are in @alchemy/wallet-api-types.
 */

import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import type {
  Account,
  Address,
  Chain,
  Client,
  Hex,
  JsonRpcAccount,
  Transport,
  WalletClient,
  LocalAccount,
} from "viem";
import type { InternalState } from "./internal";
import type { SmartWalletActions } from "./decorators/smartWalletActions";

// ─────────────────────────────────────────────────────────────────────────────
// Client Types
// ─────────────────────────────────────────────────────────────────────────────

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport<"alchemyHttp">,
  Chain,
  JsonRpcAccount<Address>,
  WalletServerViemRpcSchema,
  TExtend
>;

export type InnerWalletApiClient = BaseWalletClient<{
  internal: InternalState | undefined;
  owner: SmartWalletSigner;
  policyIds?: string[];
}>;

export type SignerClient = WalletClient<Transport, Chain | undefined, Account>;

export type SmartWalletSigner = LocalAccount | SignerClient;

export type SmartWalletClient = BaseWalletClient<SmartWalletActions>;

// ─────────────────────────────────────────────────────────────────────────────
// Helper Types
// ─────────────────────────────────────────────────────────────────────────────

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

// ─────────────────────────────────────────────────────────────────────────────
// EIP-712 Typed Data Types (simplified from viem's complex generic types)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EIP-712 typed data domain. Compatible with viem's TypedData.
 */
export type TypedDataDomain = {
  chainId?: number;
  name?: string;
  salt?: Hex; // abitype uses bytesType which resolves to Hex
  verifyingContract?: Address;
  version?: string;
};

/**
 * EIP-712 typed data parameter definition.
 */
export type TypedDataParameter = {
  name: string;
  type: string;
};

/**
 * EIP-712 message value types. Can be primitives, arrays, or nested objects.
 * Using `any` since EIP-712 messages can contain arbitrarily nested values that
 * need direct property access. Using `unknown` would require type guards at every access.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedDataMessage = { [key: string]: any };

/**
 * EIP-712 typed data definition. Simplified from viem's TypedData
 * to avoid complex generic type inference issues.
 */
export type TypedData = {
  domain?: TypedDataDomain;
  types: { [key: string]: TypedDataParameter[] };
  primaryType: string;
  message: TypedDataMessage;
};

// ─────────────────────────────────────────────────────────────────────────────
// Capabilities Types
// ─────────────────────────────────────────────────────────────────────────────

export type GasMultiplier = { multiplier: number };

export type GasParamsOverride = {
  preVerificationGas?: bigint | GasMultiplier;
  verificationGasLimit?: bigint | GasMultiplier;
  callGasLimit?: bigint | GasMultiplier;
  paymasterVerificationGasLimit?: bigint | GasMultiplier;
  paymasterPostOpGasLimit?: bigint | GasMultiplier;
  maxFeePerGas?: bigint | GasMultiplier;
  maxPriorityFeePerGas?: bigint | GasMultiplier;
};

export type NonceOverride = {
  nonceKey: bigint;
};

export type Erc20AutoPermit = {
  below: bigint;
  amount: bigint;
  durationSeconds?: number;
};

export type Erc20PermitDetails = {
  deadline: number;
  value: bigint;
};

export type Erc20AutoApprove = {
  below: bigint;
  amount?: bigint;
};

export type Erc20PreOpSettings =
  | { autoPermit: Erc20AutoPermit; permitDetails?: never }
  | { permitDetails: Erc20PermitDetails; autoPermit?: never };

export type Erc20PostOpSettings = {
  autoApprove?: Erc20AutoApprove;
};

export type Erc20PaymasterSettings = {
  tokenAddress: Address;
  maxTokenAmount?: bigint;
} & (
  | { preOpSettings: Erc20PreOpSettings; postOpSettings?: never }
  | { postOpSettings: Erc20PostOpSettings; preOpSettings?: never }
  | { preOpSettings?: never; postOpSettings?: never }
);

export type PaymasterService = {
  policyId?: string;
  policyIds?: string[];
  onlyEstimation?: boolean;
  erc20?: Erc20PaymasterSettings;
  webhookData?: string;
};

export type PermissionsCapability = {
  context: Hex;
};

export type StateOverride = {
  [address: Address]: {
    balance?: bigint;
    nonce?: bigint;
    code?: Hex;
    state?: { [slot: Hex]: Hex };
    stateDiff?: { [slot: Hex]: Hex };
  };
};

// Eip7702Auth doesn't need conversion - same format in viem and RPC
export type Eip7702AuthCapability =
  | true
  | {
      account?: Address;
      delegation:
        | "ModularAccountV2"
        | "0x69007702764179f14F51cdce752f4f775d74E139";
    };

export type PrepareCallsCapabilities = {
  permissions?: PermissionsCapability;
  /** Paymaster configuration. Named 'paymaster' to avoid conflict with viem's reserved 'paymasterService' capability. */
  paymaster?: PaymasterService;
  gasParamsOverride?: GasParamsOverride;
  eip7702Auth?: Eip7702AuthCapability;
  nonceOverride?: NonceOverride;
  stateOverride?: StateOverride;
};

export type SendPreparedCallsCapabilities = {
  permissions?: PermissionsCapability;
  /** Paymaster configuration. Named 'paymaster' to avoid conflict with viem's reserved 'paymasterService' capability. */
  paymaster?: {
    policyId?: string;
    policyIds?: string[];
    webhookData?: string;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Call Types
// ─────────────────────────────────────────────────────────────────────────────

export type Call = {
  to: Address;
  data?: Hex;
  value?: bigint;
};

// ─────────────────────────────────────────────────────────────────────────────
// Signable Message Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Signable message type for personal_sign.
 * Can be a string or a raw hex value.
 * Note: viem's SignableMessage also accepts ByteArray (Uint8Array), but Hex suffices for RPC.
 */
export type SignableMessage = string | { raw: Hex };

// ─────────────────────────────────────────────────────────────────────────────
// Permission Types (viem-native)
// ─────────────────────────────────────────────────────────────────────────────

export type Permission =
  | { type: "native-token-transfer"; data: { allowance: bigint } }
  | {
      type: "erc20-token-transfer";
      data: { allowance: bigint; address: Address };
    }
  | { type: "gas-limit"; data: { limit: bigint } }
  | { type: "contract-access"; data: { address: Address } }
  | { type: "account-functions"; data: { functions: Hex[] } }
  | { type: "functions-on-all-contracts"; data: { functions: Hex[] } }
  | {
      type: "functions-on-contract";
      data: { address: Address; functions: Hex[] };
    }
  | { type: "root"; data?: undefined }; // data is optional and absent for root permissions

// ─────────────────────────────────────────────────────────────────────────────
// GetCallsStatus Types (no action file yet)
// ─────────────────────────────────────────────────────────────────────────────

export type GetCallsStatusParams = {
  callId: Hex;
};

// ─────────────────────────────────────────────────────────────────────────────
// Signed Prepared Calls Types (viem-native)
// These are the output of signPreparedCalls and input to sendPreparedCalls
// ─────────────────────────────────────────────────────────────────────────────

// Discriminated union for proper type narrowing based on UO version
export type SignedUserOperation =
  | {
      type: "user-operation-v060";
      chainId: number;
      data: UserOperationV060;
      signature: EncodedSignature;
    }
  | {
      type: "user-operation-v070";
      chainId: number;
      data: UserOperationV070;
      signature: EncodedSignature;
    };

export type SignedAuthorization = {
  type: "authorization";
  chainId: number;
  data: {
    address: Address;
    nonce: number;
  };
  signature: EncodedSignature;
};

export type SignedPreparedCalls =
  | SignedUserOperation
  | {
      type: "array";
      data: Array<SignedUserOperation | SignedAuthorization>;
    };

export type GetCallsStatusResult = {
  id: Hex;
  chainId: number;
  atomic: boolean;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  receipts?: Array<{
    logs: Array<{
      address: Address;
      data: Hex;
      topics: Hex[];
    }>;
    status: Hex;
    blockHash: Hex;
    blockNumber: bigint;
    gasUsed: bigint;
    transactionHash: Hex;
  }>;
  details: {
    type: "user-operation";
    data: {
      hash: Hex;
    };
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Signature Request Types (for prepared calls)
// ─────────────────────────────────────────────────────────────────────────────

export type SignatureRequest =
  | { type: "personal_sign"; data: SignableMessage; rawPayload: Hex }
  | { type: "eth_signTypedData_v4"; data: TypedData; rawPayload: Hex }
  | { type: "eip7702Auth"; rawPayload: Hex };

type EncodedSignatureData =
  | Hex
  | { r: Hex; s: Hex; yParity: number }
  | { r: Hex; s: Hex; v: bigint };

export type EncodedSignature =
  | { type: "secp256k1"; data: EncodedSignatureData }
  | { type: "ecdsa"; data: EncodedSignatureData };

// ─────────────────────────────────────────────────────────────────────────────
// Fee Payment Types (shared by prepareCalls and requestQuote)
// ─────────────────────────────────────────────────────────────────────────────

export type FeePayment = {
  sponsored: boolean;
  tokenAddress?: Address;
  maxAmount: bigint;
};

// ─────────────────────────────────────────────────────────────────────────────
// User Operation Types (viem-native)
// ─────────────────────────────────────────────────────────────────────────────

export type UserOperationV060 = {
  sender: Address;
  nonce: bigint;
  initCode?: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData?: Hex;
};

export type UserOperationV070 = {
  sender: Address;
  nonce: bigint;
  factory?: Address;
  factoryData?: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymaster?: Address;
  paymasterData?: Hex;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
};

/**
 * Viem-native types for wallet API actions.
 *
 * These types use JS-native values (bigint, number) instead of hex strings.
 * They are what users interact with directly.
 *
 * The corresponding RPC/API types (with hex strings) are in @alchemy/wallet-api-types.
 */

import type { Address, Hex } from "viem";

// ─────────────────────────────────────────────────────────────────────────────
// EIP-712 Typed Data Types (simplified from viem's complex generic types)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EIP-712 typed data domain. Compatible with viem's TypedData.
 */
export type TypedDataDomain = {
  chainId?: number;
  name?: string;
  salt?: Hex;
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
 * Using a permissive type since EIP-712 messages can contain any JSON value.
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
  paymasterService?: PaymasterService;
  gasParamsOverride?: GasParamsOverride;
  eip7702Auth?: Eip7702AuthCapability;
  nonceOverride?: NonceOverride;
  stateOverride?: StateOverride;
};

export type SendPreparedCallsCapabilities = {
  permissions?: PermissionsCapability;
  paymasterService?: {
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
// Action Params Types
// ─────────────────────────────────────────────────────────────────────────────

export type PrepareCallsParams = {
  calls: Call[];
  from?: Address;
  chainId?: number;
  capabilities?: PrepareCallsCapabilities;
  paymasterPermitSignature?: {
    type: "secp256k1" | "ecdsa";
    data: Hex;
  };
};

// Note: SendPreparedCallsParams extends the signed calls result,
// which is already in the correct format. Only chainId and capabilities
// need conversion.

/**
 * Signable message type for personal_sign.
 * Can be a string or a raw hex value.
 */
export type SignableMessage = string | { raw: Hex };

export type PrepareSignParams = {
  from?: Address;
  chainId?: number;
  signatureRequest:
    | { type: "personal_sign"; data: SignableMessage }
    | { type: "eth_signTypedData_v4"; data: TypedData };
};

export type FormatSignParams = {
  from?: Address;
  chainId?: number;
  signature: {
    type: "ecdsa";
    data: Hex;
  };
};

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
  | { type: "root"; data?: undefined };

export type GrantPermissionsParams = {
  account?: Address;
  chainId?: number;
  expirySec: number;
  key: {
    publicKey: Hex;
    type: "secp256k1" | "p256";
  };
  permissions: Permission[];
};

export type GetCallsStatusParams = {
  callId: Hex;
};

// ─────────────────────────────────────────────────────────────────────────────
// Action Result Types
// ─────────────────────────────────────────────────────────────────────────────

// Note: PrepareCallsResult is defined in viemEncode.ts since it's complex

export type SendPreparedCallsResult = {
  preparedCallIds: Hex[];
  details:
    | {
        type: "user-operations";
        data: Array<{
          callId: Hex;
          hash: Hex;
          calls?: Array<{ to: Address; data?: Hex; value?: bigint }>;
        }>;
      }
    | {
        type: "user-operation";
        data: {
          hash: Hex;
          calls?: Array<{ to: Address; data?: Hex; value?: bigint }>;
        };
      };
};

export type PrepareSignResult = {
  chainId: number;
  signatureRequest:
    | { type: "personal_sign"; data: SignableMessage }
    | { type: "eth_signTypedData_v4"; data: TypedData };
};

export type FormatSignResult = {
  signature: Hex;
};

export type GrantPermissionsResult = {
  sessionId: Hex;
  chainId: number;
  signatureRequest: {
    type: "eth_signTypedData_v4";
    data: TypedData;
  };
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

export type RequestQuoteParams = {
  from: {
    address: Address;
    chainId: number;
    amount?: bigint;
  };
  to: {
    address: Address;
    chainId?: number; // Same chain if omitted
    minimumAmount?: bigint;
  };
  sender: Address;
  slippageBps?: number;
  rawCalls?: boolean;
};

export type RequestQuoteResult =
  | RequestQuoteResult_PreparedCalls
  | RequestQuoteResult_RawCalls;

// ─────────────────────────────────────────────────────────────────────────────
// Signature Request Types (for prepared calls)
// ─────────────────────────────────────────────────────────────────────────────

export type SignatureRequest =
  | { type: "personal_sign"; data: SignableMessage; rawPayload: Hex }
  | { type: "eth_signTypedData_v4"; data: TypedData; rawPayload: Hex }
  | { type: "eip7702Auth"; rawPayload: Hex };

export type EncodedSignature = {
  type: "secp256k1" | "ecdsa";
  data:
    | Hex
    | { r: Hex; s: Hex; yParity: number }
    | { r: Hex; s: Hex; v: bigint };
};

// ─────────────────────────────────────────────────────────────────────────────
// User Operation Types (viem-native)
// ─────────────────────────────────────────────────────────────────────────────

export type UserOperationV060 = {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
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

export type RequestQuoteResult_PreparedCalls = {
  quote: {
    fromAmount: bigint;
    minimumToAmount: bigint;
    expiry: bigint;
  };
  chainId: number;
  callId?: Hex;
  rawCalls: false;
  // Includes the full prepared calls result (union type)
  preparedCalls:
    | {
        type: "user-operation-v060";
        chainId: number;
        data: UserOperationV060;
        signatureRequest?: SignatureRequest;
        feePayment: {
          sponsored: boolean;
          tokenAddress?: Address;
          maxAmount: bigint;
        };
      }
    | {
        type: "user-operation-v070";
        chainId: number;
        data: UserOperationV070;
        signatureRequest?: SignatureRequest;
        feePayment: {
          sponsored: boolean;
          tokenAddress?: Address;
          maxAmount: bigint;
        };
      }
    | {
        type: "paymaster-permit";
        data: TypedData;
        signatureRequest: SignatureRequest;
        modifiedRequest: {
          from: Address;
          paymasterPermitSignature?: EncodedSignature;
          calls: Array<{ to: Address; data?: Hex; value?: bigint }>;
          capabilities?: PrepareCallsCapabilities;
          chainId: number;
        };
      }
    | {
        type: "array";
        data: Array<
          | {
              type: "user-operation-v060" | "user-operation-v070";
              chainId: number;
              data: UserOperationV060 | UserOperationV070;
              signatureRequest?: SignatureRequest;
              feePayment: {
                sponsored: boolean;
                tokenAddress?: Address;
                maxAmount: bigint;
              };
            }
          | {
              type: "authorization";
              chainId: number;
              data: { address: Address; nonce: number };
              signatureRequest: SignatureRequest;
            }
        >;
      };
};

export type RequestQuoteResult_RawCalls = {
  quote: {
    fromAmount: bigint;
    minimumToAmount: bigint;
    expiry: bigint;
  };
  chainId: number;
  callId?: Hex;
  rawCalls: true;
  calls: Array<{ to: Address; data?: Hex; value?: bigint }>;
};

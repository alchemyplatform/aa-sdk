import type {
  UserOperationStruct,
  UserOperationRequest,
  UserOperationOverrides,
  EntryPointVersion,
} from "@aa-sdk/core";
import type { Address, Hash, Hex } from "viem";

export enum SimulateAssetType {
  NATIVE = "NATIVE",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  /**
   * Special contracts that don't follow ERC 721/1155. Currently limited to
   * CryptoKitties and CryptoPunks.
   */
  SPECIAL_NFT = "SPECIAL_NFT",
}

export enum SimulateChangeType {
  APPROVE = "APPROVE",
  TRANSFER = "TRANSFER",
}

export type SimulateUserOperationAssetChangesRequest = [
  UserOperationStruct,
  entryPoint: Address,
  blockNumber?: Hash,
];

export type SimulateUserOperationAssetChangesResponse = {
  changes: SimulateAssetChange[];
  error?: SimulateAssetChangesError;
};

export interface SimulateAssetChangesError extends Record<string, any> {
  message: string;
}

export interface SimulateAssetChange {
  assetType: SimulateAssetType;
  changeType: SimulateChangeType;
  from: Address;
  to: Address;
  rawAmount?: string;
  amount?: string;
  contactAddress: Address;
  tokenId?: string;
  decimals: number;
  symbol: string;
  name?: string;
  logo?: string;
}

export type RequestGasAndPaymasterAndDataRequest = [
  {
    policyId: string | string[];
    entryPoint: Address;
    erc20Context?: {
      tokenAddress: Address;
      permit?: Hex;
      maxTokenAmount?: BigInt;
    };
    dummySignature: Hex;
    userOperation: UserOperationRequest;
    overrides?: UserOperationOverrides;
  },
];

export type RequestGasAndPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Pick<
  UserOperationRequest,
  | "callGasLimit"
  | "preVerificationGas"
  | "verificationGasLimit"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
> &
  (TEntryPointVersion extends "0.6.0"
    ? {
        paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
      }
    : TEntryPointVersion extends "0.7.0"
      ? Pick<
          UserOperationRequest<"0.7.0">,
          | "paymaster"
          | "paymasterData"
          | "paymasterVerificationGasLimit"
          | "paymasterPostOpGasLimit"
        >
      : never);

export type RequestPaymasterTokenQuoteRequest = [
  {
    policyId: string;
    entryPoint: Address;
    erc20Context?: {
      tokenAddress: Address;
      permit?: Hex;
      maxTokenAmount?: BigInt;
    };
    dummySignature: Hex;
    userOperation: UserOperationRequest;
    overrides?: UserOperationOverrides;
  },
];

export type RequestPaymasterTokenQuoteResponse = {
  tokensPerEth: string;
  estimatedTokenAmount: string;
  estimatedUsd: number;
};

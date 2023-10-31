import { Signer } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { type BigNumberish } from "@alchemy/aa-core";
import type { IBundler } from "@biconomy/bundler";
import type {
  IPaymaster,
  PaymasterFeeQuote,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";
import { BaseValidationModule, type ModuleInfo } from "@biconomy/modules";
import { Provider } from "@ethersproject/providers";
import { type GasOverheads } from "./preverificaiton.js";
import { type Hex } from "viem";

export type EntryPointAddresses = {
  [address: string]: string;
};

export type BiconomyFactories = {
  [address: string]: string;
};

export type BiconomyImplementations = {
  [address: string]: string;
};

export type EntryPointAddressesByVersion = {
  [version: string]: string;
};

export type BiconomyFactoriesByVersion = {
  [version: string]: string;
};

export type BiconomyImplementationsByVersion = {
  [version: string]: string;
};

export type SmartAccountConfig = {
  entryPointAddress: string;
  bundler?: IBundler;
};

export interface BaseSmartAccountConfig {
  // owner?: Signer // can be in child classes
  index?: number;
  provider?: Provider;
  entryPointAddress: string;
  accountAddress?: string;
  overheads?: Partial<GasOverheads>;
  paymaster?: IPaymaster; // PaymasterAPI
  bundler?: IBundler; // like HttpRpcClient
  chainId: ChainId;
}

export type BiconomyTokenPaymasterRequest = {
  feeQuote: PaymasterFeeQuote;
  spender: string;
  maxApproval?: boolean;
};

export type BiconomySmartAccountConfig = {
  signer: Signer;
  rpcUrl?: string;
  chainId: ChainId;
  entryPointAddress?: string;
  bundler?: IBundler;
  paymaster?: IPaymaster;
  nodeClientUrl?: string;
};

export interface BiconomySmartAccountV2Config extends BaseSmartAccountConfig {
  factoryAddress?: Hex;
  implementationAddress?: Hex;
  defaultFallbackHandler?: Hex;
  rpcUrl?: string; // as good as Provider
  nodeClientUrl?: string; // very specific to Biconomy
  defaultValidationModule: BaseValidationModule;
  activeValidationModule?: BaseValidationModule;
}

export type BuildUserOpOptions = {
  overrides?: Overrides;
  skipBundlerGasEstimation?: boolean;
  params?: ModuleInfo;
  nonceOptions?: NonceOptions;
  forceEncodeForBatch?: boolean;
  paymasterServiceData?: SponsorUserOperationDto;
};

export type NonceOptions = {
  nonceKey?: number;
  nonceOverride?: number;
};

// Used in AccountV1
export type SendUserOpDto = {
  signer?: Signer;
  simulationType?: SimulationType;
};

// Generic options in AccountV2
export type SendUserOpOptions = {
  simulationType?: SimulationType;
};

export type SimulationType = "validation" | "validation_and_execution";

export type Overrides = {
  callGasLimit?: Hex;
  verificationGasLimit?: Hex;
  preVerificationGas?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  paymasterData?: Hex;
  signature?: Hex;
};

export type InitilizationData = {
  accountIndex?: number;
  signerAddress?: string;
};

export type InitializeV2Data = {
  accountIndex?: number;
};

export interface TransactionDetailsForUserOp {
  target: string;
  data: string;
  value?: BigNumberish;
  gasLimit?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  nonce?: BigNumberish;
}

export type CounterFactualAddressParam = {
  index?: number;
  validationModule?: BaseValidationModule;
};

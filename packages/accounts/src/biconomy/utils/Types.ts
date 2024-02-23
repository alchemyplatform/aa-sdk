import {
  type BigNumberish,
  type SmartAccountSigner,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import { type IBundler } from "@biconomy/bundler";
import {
  type FeeQuotesOrDataDto,
  type IPaymaster,
  type PaymasterFeeQuote,
  PaymasterMode,
  type SmartAccountData,
  type SponsorUserOperationDto,
} from "@biconomy/paymaster";
import { BaseValidationModule, type ModuleInfo } from "@biconomy/modules";
import { type Hex, type WalletClient } from "viem";
import { type SupportedSigner } from "@biconomy/common";

export type EntryPointAddresses = Record<string, string>;
export type BiconomyFactories = Record<string, string>;
export type BiconomyImplementations = Record<string, string>;
export type EntryPointAddressesByVersion = Record<string, string>;
export type BiconomyFactoriesByVersion = Record<string, string>;
export type BiconomyImplementationsByVersion = Record<string, string>;

export type SmartAccountConfig = {
  /** entryPointAddress: address of the smart account factory */
  entryPointAddress: string;
  /** factoryAddress: address of the smart account factory */
  bundler?: IBundler;
};

export interface GasOverheads {
  /** fixed: fixed gas overhead */
  fixed: number;
  /** perUserOp: per user operation gas overhead */
  perUserOp: number;
  /** perUserOpWord: per user operation word gas overhead */
  perUserOpWord: number;
  /** zeroByte: per byte gas overhead */
  zeroByte: number;
  /** nonZeroByte: per non zero byte gas overhead */
  nonZeroByte: number;
  /** bundleSize: per signature bundleSize */
  bundleSize: number;
  /** sigSize: sigSize gas overhead */
  sigSize: number;
}

export type BaseSmartAccountConfig = {
  /** index: helps to not conflict with other smart account instances */
  index?: number;
  /** provider: WalletClientSigner from viem */
  provider?: WalletClient;
  /** entryPointAddress: address of the smart account entry point */
  entryPointAddress?: string;
  /** accountAddress: address of the smart account, potentially counterfactual */
  accountAddress?: string;
  /** overheads: {@link GasOverheads} */
  overheads?: Partial<GasOverheads>;
  /** paymaster: {@link IPaymaster} interface */
  paymaster?: IPaymaster;
  /** chainId: chainId of the network */
  chainId?: number;
};

export type BiconomyTokenPaymasterRequest = {
  /** feeQuote: {@link PaymasterFeeQuote} */
  feeQuote: PaymasterFeeQuote;
  /** spender: The address of the spender who is paying for the transaction, this can usually be set to feeQuotesResponse.tokenPaymasterAddress */
  spender: Hex;
  /** maxApproval: If set to true, the paymaster will approve the maximum amount of tokens required for the transaction. Not recommended */
  maxApproval?: boolean;
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type ConditionalBundlerProps = RequireAtLeastOne<
  {
    bundler: IBundler;
    bundlerUrl: string;
  },
  "bundler" | "bundlerUrl"
>;
export type ResolvedBundlerProps = {
  bundler: IBundler;
};
export type ConditionalValidationProps = RequireAtLeastOne<
  {
    defaultValidationModule: BaseValidationModule;
    signer: SupportedSigner;
  },
  "defaultValidationModule" | "signer"
>;

export type ResolvedValidationProps = {
  /** defaultValidationModule: {@link BaseValidationModule} */
  defaultValidationModule: BaseValidationModule;
  /** activeValidationModule: {@link BaseValidationModule}. The active validation module. Will default to the defaultValidationModule */
  activeValidationModule: BaseValidationModule;
  /** signer: ethers Wallet, viemWallet or alchemys SmartAccountSigner */
  signer: SmartAccountSigner;
  /** chainId: chainId of the network */
  chainId: number;
};

export type BiconomySmartAccountV2ConfigBaseProps = {
  /** Factory address of biconomy factory contract or some other contract you have deployed on chain */
  factoryAddress?: Hex;
  /** Sender address: If you want to override the Signer address with some other address and get counterfactual address can use this to pass the EOA and get SA address */
  senderAddress?: Hex;
  /** implementation of smart contract address or some other contract you have deployed and want to override */
  implementationAddress?: Hex;
  /** defaultFallbackHandler: override the default fallback contract address */
  defaultFallbackHandler?: Hex;
  /** rpcUrl: Explicitly set the rpc else it is pulled out of the signer. */
  rpcUrl?: string; // as good as Provider
  /** biconomyPaymasterApiKey: The API key retrieved from the Biconomy dashboard */
  biconomyPaymasterApiKey?: string;
  /** activeValidationModule: The active validation module. Will default to the defaultValidationModule */
  activeValidationModule?: BaseValidationModule;
  /** scanForUpgradedAccountsFromV1: set to true if you you want the userwho was using biconomy SA v1 to upgrade to biconomy SA v2 */
  scanForUpgradedAccountsFromV1?: boolean;
  /** the index of SA the EOA have generated and till which indexes the upgraded SA should scan */
  maxIndexForScan?: number;
};
export type BiconomySmartAccountV2Config =
  BiconomySmartAccountV2ConfigBaseProps &
    BaseSmartAccountConfig &
    ConditionalBundlerProps &
    ConditionalValidationProps;

export type BiconomySmartAccountV2ConfigConstructorProps =
  BiconomySmartAccountV2ConfigBaseProps &
    BaseSmartAccountConfig &
    ResolvedBundlerProps &
    ResolvedValidationProps;

export type BuildUserOpOptions = {
  /** overrides: Explicitly set gas values */
  // overrides?: Overrides;
  /** Not currently in use  */
  // skipBundlerGasEstimation?: boolean;
  /**  params relevant to the module, mostly relevant to sessions */
  params?: ModuleInfo;
  /**  nonceOptions: For overriding the nonce */
  nonceOptions?: NonceOptions;
  /**  forceEncodeForBatch: For encoding the user operation for batch */
  forceEncodeForBatch?: boolean;
  /**  paymasterServiceData: Options specific to transactions that involve a paymaster */
  paymasterServiceData?: PaymasterUserOperationDto;
  /**  simulationType: Determine which parts of the tx a bundler will simulate: "validation" | "validation_and_execution".  */
  simulationType?: SimulationType;
};

export type NonceOptions = {
  /** nonceKey: The key to use for nonce */
  nonceKey?: number;
  /** nonceOverride: The nonce to use for the transaction */
  nonceOverride?: number;
};

export type SimulationType = "validation" | "validation_and_execution";

export type Overrides = {
  /* Value used by inner account execution */
  callGasLimit?: Hex;
  /* Actual gas used by the validation of this UserOperation */
  verificationGasLimit?: Hex;
  /* Gas overhead of this UserOperation */
  preVerificationGas?: Hex;
  /* Maximum fee per gas (similar to EIP-1559 max_fee_per_gas) */
  maxFeePerGas?: Hex;
  /* Maximum priority fee per gas (similar to EIP-1559 max_priority_fee_per_gas) */
  maxPriorityFeePerGas?: Hex;
  /* Address of paymaster sponsoring the transaction, followed by extra data to send to the paymaster ("0x" for self-sponsored transaction) */
  paymasterData?: Hex;
  /* Data passed into the account along with the nonce during the verification step */
  signature?: Hex;
};

export type InitilizationData = {
  accountIndex?: number;
  signerAddress?: string;
};

export type PaymasterUserOperationDto = SponsorUserOperationDto &
  FeeQuotesOrDataDto & {
    /** mode: sponsored or erc20 */
    mode: PaymasterMode;
    /** Always recommended, especially when using token paymaster */
    calculateGasLimits?: boolean;
    /** Expiry duration in seconds */
    expiryDuration?: number;
    /** Webhooks to be fired after user op is sent */
    webhookData?: Record<string, any>;
    /** Smart account meta data */
    smartAccountInfo?: SmartAccountData;
    /** the fee-paying token address */
    feeTokenAddress?: string;
    /** The fee quote */
    feeQuote?: PaymasterFeeQuote;
    /** The address of the spender. This is usually set to FeeQuotesOrDataResponse.tokenPaymasterAddress  */
    spender?: Hex;
    /** Not recommended */
    maxApproval?: boolean;
  };

export type InitializeV2Data = {
  accountIndex?: number;
};

export type EstimateUserOpGasParams = {
  userOp: Partial<UserOperationStruct>;
  // overrides?: Overrides;
  /** Currrently has no effect */
  // skipBundlerGasEstimation?: boolean;
  /**  paymasterServiceData: Options specific to transactions that involve a paymaster */
  paymasterServiceData?: SponsorUserOperationDto;
};

export interface TransactionDetailsForUserOp {
  /** target: The address of the contract to call */
  target: string;
  /** data: The data to send to the contract */
  data: string;
  /** value: The value to send to the contract */
  value?: BigNumberish;
  /** gasLimit: The gas limit to use for the transaction */
  gasLimit?: BigNumberish;
  /** maxFeePerGas: The maximum fee per gas to use for the transaction */
  maxFeePerGas?: BigNumberish;
  /** maxPriorityFeePerGas: The maximum priority fee per gas to use for the transaction */
  maxPriorityFeePerGas?: BigNumberish;
  /** nonce: The nonce to use for the transaction */
  nonce?: BigNumberish;
}

export type CounterFactualAddressParam = {
  index?: number;
  validationModule?: BaseValidationModule;
  /** scanForUpgradedAccountsFromV1: set to true if you you want the userwho was using biconomy SA v1 to upgrade to biconomy SA v2 */
  scanForUpgradedAccountsFromV1?: boolean;
  /** the index of SA the EOA have generated and till which indexes the upgraded SA should scan */
  maxIndexForScan?: number;
};

export type QueryParamsForAddressResolver = {
  eoaAddress: Hex;
  index: number;
  moduleAddress: Hex;
  moduleSetupData: Hex;
  maxIndexForScan?: number;
};

export type SmartAccountInfo = {
  /** accountAddress: The address of the smart account */
  accountAddress: Hex;
  /** factoryAddress: The address of the smart account factory */
  factoryAddress: Hex;
  /** currentImplementation: The address of the current implementation */
  currentImplementation: string;
  /** currentVersion: The version of the smart account */
  currentVersion: string;
  /** factoryVersion: The version of the factory */
  factoryVersion: string;
  /** deploymentIndex: The index of the deployment */
  deploymentIndex: BigNumberish;
};

export type ValueOrData = RequireAtLeastOne<
  {
    value: BigNumberish | string;
    data: string;
  },
  "value" | "data"
>;
export type Transaction = {
  to: string;
} & ValueOrData;

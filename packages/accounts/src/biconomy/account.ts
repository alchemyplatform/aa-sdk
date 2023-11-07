import {
  type Hex,
  keccak256,
  encodePacked,
  getCreate2Address,
  encodeAbiParameters,
  parseAbiParameters,
  toHex,
  hexToNumber,
  toBytes,
  encodeFunctionData,
  type PublicClient,
  createPublicClient,
  http,
  concatHex,
  type GetContractReturnType,
  type Chain,
  getContract,
  decodeFunctionData,
} from "viem";
import {
  BaseSmartContractAccount,
  getChain,
  type BigNumberish,
} from "@alchemy/aa-core";
import { Logger, RPC_PROVIDER_URLS, packUserOp } from "@biconomy/common";
import {
  BaseValidationModule,
  type ModuleInfo,
  type SendUserOpParams,
} from "@biconomy/modules";
import { type UserOperation, type Transaction } from "./utils/index.js";
import {
  type IHybridPaymaster,
  type IPaymaster,
  BiconomyPaymaster,
  type SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { type IBundler, type UserOpResponse } from "@biconomy/bundler";
import {
  BICONOMY_IMPLEMENTATION_ADDRESSES_BY_VERSION,
  DEFAULT_BICONOMY_FACTORY_ADDRESS,
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
  PROXY_CREATION_CODE,
  ADDRESS_ZERO,
  type BiconomyTokenPaymasterRequest,
  type BiconomySmartAccountV2Config,
  type CounterFactualAddressParam,
  type BuildUserOpOptions,
  type Overrides,
  type NonceOptions,
} from "./utils/index.js";
import { BiconomyFactoryAbi } from "./abi/Factory.js";
import { BiconomyAccountAbi } from "./abi/SmartAccount.js";

type UserOperationKey = keyof UserOperation;

export class BiconomySmartAccountV2 extends BaseSmartContractAccount {
  private SENTINEL_MODULE = "0x0000000000000000000000000000000000000001";

  private index: number;

  private chainId: number;

  private provider: PublicClient;

  private paymaster?: IPaymaster;

  private bundler?: IBundler;

  private accountContract?: GetContractReturnType<
    typeof BiconomyAccountAbi,
    PublicClient,
    Chain
  >;

  private defaultFallbackHandlerAddress: Hex;

  private implementationAddress: Hex;

  // Validation module responsible for account deployment initCode. This acts as a default authorization module.
  defaultValidationModule: BaseValidationModule;

  // Deployed Smart Account can have more than one module enabled. When sending a transaction activeValidationModule is used to prepare and validate userOp signature.
  activeValidationModule: BaseValidationModule;

  private constructor(
    readonly biconomySmartAccountConfig: BiconomySmartAccountV2Config
  ) {
    super({
      ...biconomySmartAccountConfig,
      chain: getChain(biconomySmartAccountConfig.chainId),
      rpcClient:
        biconomySmartAccountConfig.rpcUrl ||
        (RPC_PROVIDER_URLS[biconomySmartAccountConfig.chainId] as string),
      entryPointAddress: biconomySmartAccountConfig.entryPointAddress as Hex,
      accountAddress: biconomySmartAccountConfig.accountAddress as Hex,
      factoryAddress:
        biconomySmartAccountConfig.factoryAddress ??
        DEFAULT_BICONOMY_FACTORY_ADDRESS,
    });
    this.index = biconomySmartAccountConfig.index ?? 0;
    this.chainId = biconomySmartAccountConfig.chainId;
    this.paymaster = biconomySmartAccountConfig.paymaster;
    this.bundler = biconomySmartAccountConfig.bundler;
    this.defaultValidationModule =
      biconomySmartAccountConfig.defaultValidationModule;
    this.activeValidationModule =
      biconomySmartAccountConfig.activeValidationModule ??
      this.defaultValidationModule;
    this.implementationAddress =
      biconomySmartAccountConfig.implementationAddress ??
      (BICONOMY_IMPLEMENTATION_ADDRESSES_BY_VERSION.V2_0_0 as Hex);
    const defaultFallbackHandlerAddress =
      this.factoryAddress === DEFAULT_BICONOMY_FACTORY_ADDRESS
        ? DEFAULT_FALLBACK_HANDLER_ADDRESS
        : biconomySmartAccountConfig.defaultFallbackHandler;
    if (!defaultFallbackHandlerAddress) {
      throw new Error("Default Fallback Handler address is not provided");
    }
    this.defaultFallbackHandlerAddress = defaultFallbackHandlerAddress;

    this.provider = createPublicClient({
      chain: getChain(biconomySmartAccountConfig.chainId),
      transport: http(
        biconomySmartAccountConfig.rpcUrl ||
          (RPC_PROVIDER_URLS[biconomySmartAccountConfig.chainId] as string)
      ),
    });

    // REVIEW: removed the node client
    // this.nodeClient = new NodeClient({ txServiceUrl: nodeClientUrl ?? NODE_CLIENT_URL });
  }

  public static create(
    biconomySmartAccountConfig: BiconomySmartAccountV2Config
  ): BiconomySmartAccountV2 {
    const instance = new BiconomySmartAccountV2(biconomySmartAccountConfig);
    // Can do async init stuff here
    return instance;
  }

  // Calls the getCounterFactualAddress
  async getAddress(params?: CounterFactualAddressParam): Promise<Hex> {
    if (this.accountAddress == null) {
      // means it needs deployment
      this.accountAddress = await this.getCounterFactualAddress(params);
    }
    return this.accountAddress;
  }

  // Calls the getCounterFactualAddress
  async getAccountAddress(
    params?: CounterFactualAddressParam
  ): Promise<string> {
    if (this.accountAddress == null) {
      // means it needs deployment
      this.accountAddress = await this.getCounterFactualAddress(params);
    }
    return this.accountAddress;
  }

  /**
   * Return the account's address. This value is valid even before deploying the contract.
   */
  async getCounterFactualAddress(
    params?: CounterFactualAddressParam
  ): Promise<Hex> {
    const validationModule =
      params?.validationModule ?? this.defaultValidationModule;
    const index = params?.index ?? this.index;

    try {
      const initCalldata = encodeFunctionData({
        abi: BiconomyAccountAbi,
        functionName: "init",
        args: [
          this.defaultFallbackHandlerAddress,
          validationModule.getAddress() as Hex,
          (await validationModule.getInitData()) as Hex,
        ],
      });

      const proxyCreationCodeHash = keccak256(
        encodePacked(
          ["bytes", "uint256"],
          [PROXY_CREATION_CODE, BigInt(this.implementationAddress)]
        )
      );

      const salt = keccak256(
        encodePacked(
          ["bytes32", "uint256"],
          [keccak256(initCalldata), BigInt(index)]
        )
      );

      const counterFactualAddress = getCreate2Address({
        from: this.factoryAddress,
        salt: salt,
        bytecodeHash: proxyCreationCodeHash,
      });

      return counterFactualAddress;
    } catch (e) {
      throw new Error(`Failed to get counterfactual address, ${e}`);
    }
  }

  async _getAccountContract(): Promise<
    GetContractReturnType<typeof BiconomyAccountAbi, PublicClient, Chain>
  > {
    if (this.accountContract == null) {
      this.accountContract = getContract({
        address: await this.getAddress(),
        abi: BiconomyAccountAbi,
        publicClient: this.provider as PublicClient,
      });
    }
    return this.accountContract;
  }

  isActiveValidationModuleDefined(): boolean {
    if (!this.activeValidationModule)
      throw new Error("Must provide an instance of active validation module.");
    return true;
  }

  isDefaultValidationModuleDefined(): boolean {
    if (!this.defaultValidationModule)
      throw new Error("Must provide an instance of default validation module.");
    return true;
  }

  setActiveValidationModule(
    validationModule: BaseValidationModule
  ): BiconomySmartAccountV2 {
    if (validationModule instanceof BaseValidationModule) {
      this.activeValidationModule = validationModule;
    }
    return this;
  }

  setDefaultValidationModule(
    validationModule: BaseValidationModule
  ): BiconomySmartAccountV2 {
    if (validationModule instanceof BaseValidationModule) {
      this.defaultValidationModule = validationModule;
    }
    return this;
  }

  /**
   * Return the value to put into the "initCode" field, if the account is not yet deployed.
   * This value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<Hex> {
    this.isDefaultValidationModuleDefined();

    return concatHex([
      this.factoryAddress as Hex,
      encodeFunctionData({
        abi: BiconomyFactoryAbi,
        functionName: "deployCounterFactualAccount",
        args: [
          this.defaultValidationModule.getAddress() as Hex,
          (await this.defaultValidationModule.getInitData()) as Hex,
          BigInt(this.index),
        ],
      }),
    ]);
  }

  /**
   *
   * @param to { target } address of transaction
   * @param value  represents amount of native tokens
   * @param data represent data associated with transaction
   * @returns encoded data for execute function
   */
  async encodeExecute(to: Hex, value: bigint, data: Hex): Promise<Hex> {
    // return accountContract.interface.encodeFunctionData("execute_ncC", [to, value, data]) as Hex;
    return encodeFunctionData({
      abi: BiconomyAccountAbi,
      functionName: "execute_ncC",
      args: [to, value, data],
    });
  }

  /**
   *
   * @param to { target } array of addresses in transaction
   * @param value  represents array of amount of native tokens associated with each transaction
   * @param data represent array of data associated with each transaction
   * @returns encoded data for executeBatch function
   */
  async encodeExecuteBatch(
    to: Array<Hex>,
    value: Array<bigint>,
    data: Array<Hex>
  ): Promise<Hex> {
    return encodeFunctionData({
      abi: BiconomyAccountAbi,
      functionName: "executeBatch_y6U",
      args: [to, value, data],
    });
  }

  // dummy signature depends on the validation module supplied.
  async getDummySignatures(params?: ModuleInfo): Promise<Hex> {
    this.isActiveValidationModuleDefined();
    return (await this.activeValidationModule.getDummySignature(params)) as Hex;
  }

  // TODO: review this
  getDummySignature(): Hex {
    throw new Error("Method not implemented! Call getDummySignatures instead.");
  }

  // Might use provided paymaster instance to get dummy data (from pm service)
  getDummyPaymasterData(): string {
    return "0x";
  }

  validateUserOp(
    userOp: Partial<UserOperation>,
    requiredFields: UserOperationKey[]
  ): boolean {
    for (const field of requiredFields) {
      if (!userOp[field]) {
        throw new Error(`${String(field)} is missing in the UserOp`);
      }
    }
    return true;
  }

  async signUserOp(
    userOp: Partial<UserOperation>,
    params?: SendUserOpParams
  ): Promise<UserOperation> {
    this.isActiveValidationModuleDefined();
    const requiredFields: UserOperationKey[] = [
      "sender",
      "nonce",
      "initCode",
      "callData",
      "callGasLimit",
      "verificationGasLimit",
      "preVerificationGas",
      "maxFeePerGas",
      "maxPriorityFeePerGas",
      "paymasterAndData",
    ];
    this.validateUserOp(userOp, requiredFields);
    const userOpHash = await this.getUserOpHash(userOp);

    const moduleSig = (await this.activeValidationModule.signUserOpHash(
      userOpHash,
      params
    )) as Hex;

    const signatureWithModuleAddress = this.getSignatureWithModuleAddress(
      moduleSig,
      this.activeValidationModule.getAddress() as Hex
    );

    userOp.signature = signatureWithModuleAddress;
    return userOp as UserOperation;
  }

  getSignatureWithModuleAddress(
    moduleSignature: Hex,
    moduleAddress?: Hex
  ): Hex {
    const moduleAddressToUse =
      moduleAddress ?? (this.activeValidationModule.getAddress() as Hex);
    return encodeAbiParameters(parseAbiParameters("bytes, address"), [
      moduleSignature,
      moduleAddressToUse,
    ]);
  }

  /**
   *
   * @param userOp
   * @param params
   * @description This function call will take 'unsignedUserOp' as an input, sign it with the owner key, and send it to the bundler.
   * @returns Promise<UserOpResponse>
   */
  async sendUserOp(
    userOp: Partial<UserOperation>,
    params?: ModuleInfo
  ): Promise<UserOpResponse> {
    Logger.log("userOp received in base account ", userOp);
    delete userOp.signature;
    const userOperation = await this.signUserOp(userOp, params);
    const bundlerResponse = await this.sendSignedUserOp(userOperation);
    return bundlerResponse;
  }

  /**
   *
   * @param userOp
   * @description This function call will take 'signedUserOp' as input and send it to the bundler
   * @returns
   */
  async sendSignedUserOp(userOp: UserOperation): Promise<UserOpResponse> {
    const requiredFields: UserOperationKey[] = [
      "sender",
      "nonce",
      "initCode",
      "callData",
      "callGasLimit",
      "verificationGasLimit",
      "preVerificationGas",
      "maxFeePerGas",
      "maxPriorityFeePerGas",
      "paymasterAndData",
      "signature",
    ];
    this.validateUserOp(userOp, requiredFields);
    Logger.log("userOp validated");
    if (!this.bundler) throw new Error("Bundler is not provided");
    Logger.log("userOp being sent to the bundler", userOp);
    const bundlerResponse = await this.bundler.sendUserOp(userOp);
    return bundlerResponse;
  }

  async getUserOpHash(userOp: Partial<UserOperation>): Promise<Hex> {
    const userOpHash = keccak256(packUserOp(userOp, true) as Hex);
    const enc = encodeAbiParameters(
      parseAbiParameters("bytes32, address, uint256"),
      [userOpHash, this.entryPoint.address, BigInt(this.chainId)]
    );
    return keccak256(enc);
  }

  // TODO // Should make this a Dto
  async estimateUserOpGas(
    userOp: Partial<UserOperation>,
    overrides?: Overrides,
    skipBundlerGasEstimation?: boolean,
    paymasterServiceData?: SponsorUserOperationDto
  ): Promise<Partial<UserOperation>> {
    const requiredFields: UserOperationKey[] = [
      "sender",
      "nonce",
      "initCode",
      "callData",
    ];
    this.validateUserOp(userOp, requiredFields);

    const finalUserOp = userOp;
    const skipBundlerCall = skipBundlerGasEstimation ?? true;
    // Override gas values in userOp if provided in overrides params
    if (overrides) {
      userOp = { ...userOp, ...overrides };
    }

    Logger.log("userOp in estimation", userOp);

    if (skipBundlerCall) {
      // Review: instead of checking mode it could be assumed or just pass gasless flag and use it
      // make pmService data locally and pass the object with default values
      if (
        this.paymaster &&
        this.paymaster instanceof BiconomyPaymaster &&
        paymasterServiceData?.mode === PaymasterMode.SPONSORED
      ) {
        if (!userOp.maxFeePerGas && !userOp.maxPriorityFeePerGas) {
          throw new Error(
            "maxFeePerGas and maxPriorityFeePerGas are required for skipBundlerCall mode"
          );
        }
        // Making call to paymaster to get gas estimations for userOp
        const {
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          paymasterAndData,
        } = await (
          this.paymaster as IHybridPaymaster<SponsorUserOperationDto>
        ).getPaymasterAndData(userOp, paymasterServiceData);
        finalUserOp.verificationGasLimit =
          toHex(Number(verificationGasLimit)) ?? userOp.verificationGasLimit;
        finalUserOp.callGasLimit =
          toHex(Number(callGasLimit)) ?? userOp.callGasLimit;
        finalUserOp.preVerificationGas =
          toHex(Number(preVerificationGas)) ?? userOp.preVerificationGas;
        finalUserOp.paymasterAndData =
          (paymasterAndData as Hex) ?? userOp.paymasterAndData;
      } else {
        Logger.warn(
          "Skipped paymaster call. If you are using paymasterAndData, generate data externally"
        );
        // finalUserOp = await this.calculateUserOpGasValues(userOp);
        finalUserOp.paymasterAndData = "0x";
      }
    } else {
      if (!this.bundler) throw new Error("Bundler is not provided");
      // TODO: is this still needed to delete?
      delete userOp.maxFeePerGas;
      delete userOp.maxPriorityFeePerGas;
      // Making call to bundler to get gas estimations for userOp
      const {
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
      } = await this.bundler.estimateUserOpGas(userOp);
      // if neither user sent gas fee nor the bundler, estimate gas from provider
      if (
        !userOp.maxFeePerGas &&
        !userOp.maxPriorityFeePerGas &&
        (!maxFeePerGas || !maxPriorityFeePerGas)
      ) {
        const feeData = await this.provider.estimateFeesPerGas();
        if (feeData.maxFeePerGas?.toString()) {
          finalUserOp.maxFeePerGas = ("0x" +
            feeData.maxFeePerGas.toString(16)) as Hex;
        } else if (feeData.gasPrice?.toString()) {
          finalUserOp.maxFeePerGas = ("0x" +
            feeData.gasPrice.toString(16)) as Hex;
        } else {
          finalUserOp.maxFeePerGas = ("0x" +
            (await this.provider.getGasPrice()).toString(16)) as Hex;
        }

        if (feeData.maxPriorityFeePerGas?.toString()) {
          finalUserOp.maxPriorityFeePerGas = ("0x" +
            feeData.maxPriorityFeePerGas?.toString()) as Hex;
        } else if (feeData.gasPrice?.toString()) {
          finalUserOp.maxPriorityFeePerGas = toHex(
            Number(feeData.gasPrice?.toString())
          );
        } else {
          finalUserOp.maxPriorityFeePerGas = ("0x" +
            (await this.provider.getGasPrice()).toString(16)) as Hex;
        }
      } else {
        finalUserOp.maxFeePerGas =
          toHex(Number(maxFeePerGas)) ?? userOp.maxFeePerGas;
        finalUserOp.maxPriorityFeePerGas =
          toHex(Number(maxPriorityFeePerGas)) ?? userOp.maxPriorityFeePerGas;
      }
      finalUserOp.verificationGasLimit =
        toHex(Number(verificationGasLimit)) ?? userOp.verificationGasLimit;
      finalUserOp.callGasLimit =
        toHex(Number(callGasLimit)) ?? userOp.callGasLimit;
      finalUserOp.preVerificationGas =
        toHex(Number(preVerificationGas)) ?? userOp.preVerificationGas;
      finalUserOp.paymasterAndData = "0x";
    }
    return finalUserOp;
  }

  // Could call it nonce space
  async getNonce(nonceKey?: number): Promise<bigint> {
    const nonceSpace = nonceKey ?? 0;
    try {
      const address = await this.getAddress();
      return await this.entryPoint.read.getNonce([address, BigInt(nonceSpace)]);
    } catch (e) {
      return BigInt(0);
    }
  }

  private async getBuildUserOpNonce(
    nonceOptions: NonceOptions | undefined
  ): Promise<BigNumberish> {
    let nonce = BigInt(0);
    try {
      if (nonceOptions?.nonceOverride) {
        nonce = BigInt(nonceOptions?.nonceOverride);
      } else {
        const _nonceSpace = nonceOptions?.nonceKey ?? 0;
        nonce = await this.getNonce(_nonceSpace);
      }
    } catch (error) {
      // Not throwing this error as nonce would be 0 if this.getNonce() throw exception, which is expected flow for undeployed account
      Logger.log(
        "Error while getting nonce for the account. This is expected for undeployed accounts set nonce to 0"
      );
    }
    return nonce;
  }

  private async getGasFeeValues(
    overrides: Overrides | undefined,
    skipBundlerGasEstimation: boolean | undefined
  ): Promise<{ maxFeePerGas?: string; maxPriorityFeePerGas?: string }> {
    const gasFeeValues = {
      maxFeePerGas: overrides?.maxFeePerGas as string,
      maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas as string,
    };
    try {
      if (
        this.bundler &&
        !gasFeeValues.maxFeePerGas &&
        !gasFeeValues.maxPriorityFeePerGas &&
        (skipBundlerGasEstimation ?? true)
      ) {
        const gasFeeEstimation = await this.bundler.getGasFeeValues();
        gasFeeValues.maxFeePerGas = gasFeeEstimation.maxFeePerGas;
        gasFeeValues.maxPriorityFeePerGas =
          gasFeeEstimation.maxPriorityFeePerGas;
      }
      return gasFeeValues;
    } catch (error: any) {
      // TODO: should throw error here?
      Logger.error(
        "Error while getting gasFeeValues from bundler. Provided bundler might not have getGasFeeValues endpoint",
        error
      );
      return gasFeeValues;
    }
  }

  async buildUserOp(
    transactions: Transaction[],
    buildUseropDto?: BuildUserOpOptions
  ): Promise<Partial<UserOperation>> {
    const to = transactions.map((element: Transaction) => element.to as Hex);
    const data = transactions.map(
      (element: Transaction) => (element.data as Hex) ?? "0x"
    );
    const value = transactions.map(
      (element: Transaction) => (element.value as bigint) ?? BigInt(0)
    );

    const initCodeFetchPromise = this.getInitCode();
    const dummySignatureFetchPromise = this.getDummySignatures(
      buildUseropDto?.params
    );

    const [nonceFromFetch, initCode, signature, finalGasFeeValue] =
      await Promise.all([
        this.getBuildUserOpNonce(buildUseropDto?.nonceOptions),
        initCodeFetchPromise,
        dummySignatureFetchPromise,
        this.getGasFeeValues(
          buildUseropDto?.overrides,
          buildUseropDto?.skipBundlerGasEstimation
        ),
      ]);

    if (transactions.length === 0) {
      throw new Error("Transactions array cannot be empty");
    }
    let callData: Hex = "0x";
    if (transactions.length > 1 || buildUseropDto?.forceEncodeForBatch) {
      callData = await this.encodeExecuteBatch(to, value, data);
    } else {
      // transactions.length must be 1
      callData = await this.encodeExecute(to[0], value[0], data[0]);
    }

    let userOp: Partial<UserOperation> = {
      sender: (await this.getAccountAddress()) as Hex,
      nonce: toHex(nonceFromFetch),
      initCode,
      callData: callData,
    };

    if (finalGasFeeValue.maxFeePerGas) {
      userOp.maxFeePerGas = toHex(Number(finalGasFeeValue.maxFeePerGas));
    }
    if (finalGasFeeValue.maxPriorityFeePerGas) {
      userOp.maxPriorityFeePerGas = toHex(
        Number(finalGasFeeValue.maxPriorityFeePerGas)
      );
    }

    // for this Smart Account current validation module dummy signature will be used to estimate gas
    userOp.signature = signature;

    // Note: Can change the default behaviour of calling estimations using bundler/local
    userOp = await this.estimateUserOpGas(
      userOp,
      buildUseropDto?.overrides,
      buildUseropDto?.skipBundlerGasEstimation,
      buildUseropDto?.paymasterServiceData
    );
    Logger.log("UserOp after estimation ", userOp);

    return userOp;
  }

  private validateUserOpAndPaymasterRequest(
    userOp: Partial<UserOperation>,
    tokenPaymasterRequest: BiconomyTokenPaymasterRequest
  ): void {
    if (!userOp.callData) {
      throw new Error("UserOp callData cannot be undefined");
    }

    const feeTokenAddress = tokenPaymasterRequest?.feeQuote?.tokenAddress;
    Logger.log("Requested fee token is ", feeTokenAddress);

    if (!feeTokenAddress || feeTokenAddress === ADDRESS_ZERO) {
      throw new Error(
        "Invalid or missing token address. Token address must be part of the feeQuote in tokenPaymasterRequest"
      );
    }

    const spender = tokenPaymasterRequest?.spender;
    Logger.log("Spender address is ", spender);

    if (!spender || spender === ADDRESS_ZERO) {
      throw new Error(
        "Invalid or missing spender address. Sepnder address must be part of tokenPaymasterRequest"
      );
    }
  }

  /**
   *
   * @param userOp partial user operation without signature and paymasterAndData
   * @param tokenPaymasterRequest This dto provides information about fee quote. Fee quote is received from earlier request getFeeQuotesOrData() to the Biconomy paymaster.
   *  maxFee and token decimals from the quote, along with the spender is required to append approval transaction.
   * @notice This method should be called when gas is paid in ERC20 token using TokenPaymaster
   * @description Optional method to update the userOp.calldata with batched transaction which approves the paymaster spender with necessary amount(if required)
   * @returns updated userOp with new callData, callGasLimit
   */
  async buildTokenPaymasterUserOp(
    userOp: Partial<UserOperation>,
    tokenPaymasterRequest: BiconomyTokenPaymasterRequest
  ): Promise<Partial<UserOperation>> {
    this.validateUserOpAndPaymasterRequest(userOp, tokenPaymasterRequest);
    try {
      let batchTo: Array<Hex> = [];
      let batchValue: Array<bigint> = [];
      let batchData: Array<Hex> = [];

      let newCallData = userOp.callData;
      Logger.log(
        "Received information about fee token address and quote ",
        tokenPaymasterRequest
      );

      if (this.paymaster && this.paymaster instanceof BiconomyPaymaster) {
        // Make a call to paymaster.buildTokenApprovalTransaction() with necessary details

        // Review: might request this form of an array of Transaction
        const approvalRequest: Transaction = await (
          this.paymaster as IHybridPaymaster<SponsorUserOperationDto>
        ).buildTokenApprovalTransaction(tokenPaymasterRequest);
        Logger.log("ApprovalRequest is for erc20 token ", approvalRequest.to);

        if (
          approvalRequest.data === "0x" ||
          approvalRequest.to === ADDRESS_ZERO
        ) {
          return userOp;
        }

        if (!userOp.callData) {
          throw new Error("UserOp callData cannot be undefined");
        }

        const decodedSmartAccountData = decodeFunctionData({
          abi: BiconomyAccountAbi,
          data: userOp.callData,
        });

        if (!decodedSmartAccountData) {
          throw new Error(
            "Could not parse userOp call data for this smart account"
          );
        }

        const smartAccountExecFunctionName =
          decodedSmartAccountData.functionName;

        Logger.log(
          `Originally an ${smartAccountExecFunctionName} method call for Biconomy Account V2`
        );
        if (
          smartAccountExecFunctionName === "execute" ||
          smartAccountExecFunctionName === "execute_ncC"
        ) {
          const methodArgsSmartWalletExecuteCall = decodedSmartAccountData.args;
          const toOriginal = methodArgsSmartWalletExecuteCall[0];
          const valueOriginal = methodArgsSmartWalletExecuteCall[1];
          const dataOriginal = methodArgsSmartWalletExecuteCall[2];

          batchTo.push(toOriginal);
          batchValue.push(valueOriginal);
          batchData.push(dataOriginal);
        } else if (
          smartAccountExecFunctionName === "executeBatch" ||
          smartAccountExecFunctionName === "executeBatch_y6U"
        ) {
          const methodArgsSmartWalletExecuteCall = decodedSmartAccountData.args;
          batchTo = [...methodArgsSmartWalletExecuteCall[0]];
          batchValue = [...methodArgsSmartWalletExecuteCall[1]];
          batchData = [...methodArgsSmartWalletExecuteCall[2]];
        }

        if (
          approvalRequest.to &&
          approvalRequest.data &&
          approvalRequest.value
        ) {
          batchTo = [approvalRequest.to as Hex, ...batchTo];
          batchValue = [
            BigInt(Number(approvalRequest.value.toString())),
            ...batchValue,
          ];
          batchData = [approvalRequest.data as Hex, ...batchData];

          newCallData = await this.encodeExecuteBatch(
            batchTo,
            batchValue,
            batchData
          );
        }
        let finalUserOp: Partial<UserOperation> = {
          ...userOp,
          callData: newCallData,
        };

        // Requesting to update gas limits again (especially callGasLimit needs to be re-calculated)
        try {
          finalUserOp = await this.estimateUserOpGas(finalUserOp);
          const callGasLimit = finalUserOp.callGasLimit;
          if (callGasLimit && hexToNumber(callGasLimit) < 21000) {
            return {
              ...userOp,
              callData: newCallData,
            };
          }
          Logger.log("UserOp after estimation ", finalUserOp);
        } catch (error) {
          Logger.error(
            "Failed to estimate gas for userOp with updated callData ",
            error
          );
          Logger.log(
            "Sending updated userOp. calculateGasLimit flag should be sent to the paymaster to be able to update callGasLimit"
          );
        }
        return finalUserOp;
      }
    } catch (error) {
      Logger.log("Failed to update userOp. Sending back original op");
      Logger.error("Failed to update callData with error", error);
      return userOp;
    }
    return userOp;
  }

  async signUserOpHash(
    userOpHash: string,
    params?: ModuleInfo
  ): Promise<string> {
    this.isActiveValidationModuleDefined();
    const moduleSig = (await this.activeValidationModule.signUserOpHash(
      userOpHash,
      params
    )) as Hex;

    const signatureWithModuleAddress = encodeAbiParameters(
      parseAbiParameters("bytes, address"),
      [moduleSig, this.activeValidationModule.getAddress() as Hex]
    );

    return signatureWithModuleAddress;
  }

  async signMessage(message: string | Uint8Array): Promise<Hex> {
    this.isActiveValidationModuleDefined();
    const dataHash = typeof message === "string" ? toBytes(message) : message;
    let signature = await this.activeValidationModule.signMessage(dataHash);

    const potentiallyIncorrectV = parseInt(signature.slice(-2), 16);
    if (![27, 28].includes(potentiallyIncorrectV)) {
      const correctV = potentiallyIncorrectV + 27;
      signature = signature.slice(0, -2) + correctV.toString(16);
    }
    if (signature.slice(0, 2) !== "0x") {
      signature = "0x" + signature;
    }
    return signature as Hex;
  }

  async enableModule(moduleAddress: Hex): Promise<UserOpResponse> {
    const tx: Transaction = await this.getEnableModuleData(moduleAddress);
    const partialUserOp = await this.buildUserOp([tx]);
    return this.sendUserOp(partialUserOp);
  }

  async getEnableModuleData(moduleAddress: Hex): Promise<Transaction> {
    const callData = encodeFunctionData({
      abi: BiconomyAccountAbi,
      functionName: "enableModule",
      args: [moduleAddress],
    });
    const tx: Transaction = {
      to: await this.getAddress(),
      value: "0",
      data: callData,
    };
    return tx;
  }

  async getSetupAndEnableModuleData(
    moduleAddress: Hex,
    moduleSetupData: Hex
  ): Promise<Transaction> {
    const callData = encodeFunctionData({
      abi: BiconomyAccountAbi,
      functionName: "setupAndEnableModule",
      args: [moduleAddress, moduleSetupData],
    });
    const tx: Transaction = {
      to: await this.getAddress(),
      value: "0",
      data: callData,
    };
    return tx;
  }

  async disableModule(
    preModule: Hex,
    moduleAddress: Hex
  ): Promise<UserOpResponse> {
    const tx: Transaction = await this.getDisableModuleData(
      preModule,
      moduleAddress
    );
    const partialUserOp = await this.buildUserOp([tx]);
    return this.sendUserOp(partialUserOp);
  }

  async getDisableModuleData(
    prevModule: Hex,
    moduleAddress: Hex
  ): Promise<Transaction> {
    const callData = encodeFunctionData({
      abi: BiconomyAccountAbi,
      functionName: "disableModule",
      args: [prevModule, moduleAddress],
    });
    const tx: Transaction = {
      to: await this.getAddress(),
      value: "0",
      data: callData,
    };
    return tx;
  }

  async isModuleEnabled(moduleName: Hex): Promise<boolean> {
    const accountContract = await this._getAccountContract();
    return accountContract.read.isModuleEnabled([moduleName]);
  }

  // Review
  async getAllModules(pageSize?: number): Promise<Array<string>> {
    pageSize = pageSize ?? 100;
    const accountContract = await this._getAccountContract();
    const result = await accountContract.read.getModulesPaginated([
      this.SENTINEL_MODULE as Hex,
      BigInt(pageSize),
    ]);
    const modules: Array<string> = result[0] as Array<string>;
    return modules;
  }
}

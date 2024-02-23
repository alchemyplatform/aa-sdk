import {
  type Hex,
  keccak256,
  encodePacked,
  getCreate2Address,
  encodeAbiParameters,
  parseAbiParameters,
  toHex,
  toBytes,
  encodeFunctionData,
  type PublicClient,
  createPublicClient,
  http,
  concatHex,
  type GetContractReturnType,
  getContract,
  decodeFunctionData,
} from "viem";
import {
  BaseSmartContractAccount,
  getChain,
  type BigNumberish,
  type UserOperationStruct,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { isNullOrUndefined, packUserOp } from "./utils/Utils.js";
import {
  BaseValidationModule,
  type ModuleInfo,
  type SendUserOpParams,
  createECDSAOwnershipValidationModule,
} from "@biconomy/modules";
import {
  type IHybridPaymaster,
  type IPaymaster,
  Paymaster,
  PaymasterMode,
  type SponsorUserOperationDto,
  Bundler,
  type IBundler,
  type UserOpResponse,
  extractChainIdFromBundlerUrl,
  convertSigner,
} from "./index.js";
import {
  type BiconomyTokenPaymasterRequest,
  type BiconomySmartAccountV2Config,
  type CounterFactualAddressParam,
  type BuildUserOpOptions,
  type NonceOptions,
  type Transaction,
  type QueryParamsForAddressResolver,
  type BiconomySmartAccountV2ConfigConstructorProps,
  type PaymasterUserOperationDto,
  type SimulationType,
} from "./utils/Types.js";
import {
  ADDRESS_RESOLVER_ADDRESS,
  BICONOMY_IMPLEMENTATION_ADDRESSES_BY_VERSION,
  DEFAULT_BICONOMY_FACTORY_ADDRESS,
  DEFAULT_FALLBACK_HANDLER_ADDRESS,
  PROXY_CREATION_CODE,
  ADDRESS_ZERO,
  DEFAULT_ENTRYPOINT_ADDRESS,
  ERROR_MESSAGES,
} from "./utils/Constants.js";
import { BiconomyFactoryAbi } from "./abi/Factory.js";
import { BiconomyAccountAbi } from "./abi/SmartAccount.js";
import { AccountResolverAbi } from "./abi/AccountResolver.js";
import { Logger } from "@biconomy/common";
import {
  type FeeQuotesOrDataDto,
  type FeeQuotesOrDataResponse,
} from "@biconomy/paymaster";

type UserOperationKey = keyof UserOperationStruct;

export class BiconomySmartAccountV2 extends BaseSmartContractAccount {
  private SENTINEL_MODULE = "0x0000000000000000000000000000000000000001";

  private index: number;

  private chainId: number;

  private provider: PublicClient;

  paymaster?: IPaymaster;

  bundler?: IBundler;

  private accountContract?: GetContractReturnType<
    typeof BiconomyAccountAbi,
    PublicClient
  >;

  private defaultFallbackHandlerAddress: Hex;

  private implementationAddress: Hex;

  private scanForUpgradedAccountsFromV1!: boolean;

  private maxIndexForScan!: number;

  // Validation module responsible for account deployment initCode. This acts as a default authorization module.
  defaultValidationModule!: BaseValidationModule;

  // Deployed Smart Account can have more than one module enabled. When sending a transaction activeValidationModule is used to prepare and validate userOp signature.
  activeValidationModule!: BaseValidationModule;

  private constructor(
    readonly biconomySmartAccountConfig: BiconomySmartAccountV2ConfigConstructorProps
  ) {
    super({
      ...biconomySmartAccountConfig,
      chain: getChain(biconomySmartAccountConfig.chainId),
      rpcClient:
        biconomySmartAccountConfig.rpcUrl ||
        getChain(biconomySmartAccountConfig.chainId).rpcUrls.default.http[0],
      entryPointAddress:
        (biconomySmartAccountConfig.entryPointAddress as Hex) ??
        DEFAULT_ENTRYPOINT_ADDRESS,
      accountAddress:
        (biconomySmartAccountConfig.accountAddress as Hex) ?? undefined,
      factoryAddress:
        biconomySmartAccountConfig.factoryAddress ??
        DEFAULT_BICONOMY_FACTORY_ADDRESS,
    });

    this.defaultValidationModule =
      biconomySmartAccountConfig.defaultValidationModule;
    this.activeValidationModule =
      biconomySmartAccountConfig.activeValidationModule;

    this.index = biconomySmartAccountConfig.index ?? 0;
    this.chainId = biconomySmartAccountConfig.chainId;
    this.bundler = biconomySmartAccountConfig.bundler;
    this.implementationAddress =
      biconomySmartAccountConfig.implementationAddress ??
      (BICONOMY_IMPLEMENTATION_ADDRESSES_BY_VERSION.V2_0_0 as Hex);

    if (biconomySmartAccountConfig.biconomyPaymasterApiKey) {
      this.paymaster = new Paymaster({
        paymasterUrl: `https://paymaster.biconomy.io/api/v1/${biconomySmartAccountConfig.chainId}/${biconomySmartAccountConfig.biconomyPaymasterApiKey}`,
      });
    } else {
      this.paymaster = biconomySmartAccountConfig.paymaster;
    }

    this.bundler = biconomySmartAccountConfig.bundler;

    const defaultFallbackHandlerAddress =
      this.factoryAddress === DEFAULT_BICONOMY_FACTORY_ADDRESS
        ? DEFAULT_FALLBACK_HANDLER_ADDRESS
        : biconomySmartAccountConfig.defaultFallbackHandler;
    if (!defaultFallbackHandlerAddress) {
      throw new Error("Default Fallback Handler address is not provided");
    }
    this.defaultFallbackHandlerAddress = defaultFallbackHandlerAddress;

    // Added bang operator to avoid null check as the constructor have these params as optional
    this.defaultValidationModule =
      biconomySmartAccountConfig.defaultValidationModule!;
    this.activeValidationModule =
      biconomySmartAccountConfig.activeValidationModule!;

    this.provider = createPublicClient({
      chain: getChain(biconomySmartAccountConfig.chainId),
      transport: http(
        biconomySmartAccountConfig.rpcUrl ||
          getChain(biconomySmartAccountConfig.chainId).rpcUrls.default.http[0]
      ),
    });

    this.scanForUpgradedAccountsFromV1 =
      biconomySmartAccountConfig.scanForUpgradedAccountsFromV1 ?? false;
    this.maxIndexForScan = biconomySmartAccountConfig.maxIndexForScan ?? 10;
  }

  /**
   * Creates a new instance of BiconomySmartAccountV2
   *
   * This method will create a BiconomySmartAccountV2 instance but will not deploy the Smart Account
   * Deployment of the Smart Account will be donewith the first user operation.
   *
   * - Docs: https://docs.biconomy.io/Account/integration#integration-1
   *
   * @param biconomySmartAccountConfig - Configuration for initializing the BiconomySmartAccountV2 instance.
   * @returns A promise that resolves to a new instance of BiconomySmartAccountV2.
   * @throws An error if something is wrong with the smart account instance creation.
   *
   * @example
   * import { createClient } from "viem"
   * import { createSmartAccountClient, BiconomySmartAccountV2 } from "@biconomy/account"
   * import { createWalletClient, http } from "viem";
   * import { polygonMumbai } from "viem/chains";
   *
   * const signer = createWalletClient({
   *   account,
   *   chain: polygonMumbai,
   *   transport: http(),
   * });
   *
   * const bundlerUrl = "" // Retrieve bundler url from dasboard
   *
   * const smartAccountFromStaticCreate = await BiconomySmartAccountV2.create({ signer, bundlerUrl });
   *
   * // Is the same as...
   *
   * const smartAccount = await createSmartAccountClient({ signer, bundlerUrl });
   *
   */
  public static async create(
    biconomySmartAccountConfig: BiconomySmartAccountV2Config
  ): Promise<BiconomySmartAccountV2> {
    let chainId = biconomySmartAccountConfig.chainId;
    let resolvedSmartAccountSigner!: SmartAccountSigner;
    let rpcUrl = biconomySmartAccountConfig.rpcUrl;

    // Signer needs to be initialised here before defaultValidationModule is set
    if (biconomySmartAccountConfig.signer) {
      const signerResult = await convertSigner(
        biconomySmartAccountConfig.signer,
        !!chainId
      );
      if (!chainId && !!signerResult.chainId) {
        chainId = signerResult.chainId;
      }
      if (!rpcUrl && !!signerResult.rpcUrl) {
        rpcUrl = signerResult.rpcUrl;
      }
      resolvedSmartAccountSigner = signerResult.signer;
    }
    if (!chainId) {
      // Get it from bundler
      if (biconomySmartAccountConfig.bundlerUrl) {
        chainId = extractChainIdFromBundlerUrl(
          biconomySmartAccountConfig.bundlerUrl
        );
      } else if (biconomySmartAccountConfig.bundler) {
        const bundlerUrlFromBundler =
          biconomySmartAccountConfig.bundler.getBundlerUrl();
        chainId = extractChainIdFromBundlerUrl(bundlerUrlFromBundler);
      }
    }
    if (!chainId) {
      throw new Error("chainId required");
    }
    const bundler: IBundler =
      biconomySmartAccountConfig.bundler ??
      new Bundler({
        bundlerUrl: biconomySmartAccountConfig.bundlerUrl!,
        chainId,
      });
    let defaultValidationModule =
      biconomySmartAccountConfig.defaultValidationModule;

    // Note: If no module is provided, we will use ECDSA_OWNERSHIP as default
    if (!defaultValidationModule) {
      const newModule = await createECDSAOwnershipValidationModule({
        signer: resolvedSmartAccountSigner!,
      });
      defaultValidationModule = newModule;
    }
    const activeValidationModule =
      biconomySmartAccountConfig?.activeValidationModule ??
      defaultValidationModule;
    if (!resolvedSmartAccountSigner) {
      resolvedSmartAccountSigner = await activeValidationModule.getSigner();
    }
    if (!resolvedSmartAccountSigner) {
      throw new Error("signer required");
    }
    const config: BiconomySmartAccountV2ConfigConstructorProps = {
      ...biconomySmartAccountConfig,
      defaultValidationModule,
      activeValidationModule,
      chainId,
      bundler,
      signer: resolvedSmartAccountSigner,
      rpcUrl,
    };

    return new BiconomySmartAccountV2(config);
  }

  // Calls the getCounterFactualAddress
  async getAddress(params?: CounterFactualAddressParam): Promise<Hex> {
    if (this.accountAddress === null) {
      // means it needs deployment
      this.accountAddress = await this.getCounterFactualAddress(params);
    }
    return this.accountAddress ?? "0x";
  }

  // Calls the getCounterFactualAddress
  async getAccountAddress(
    params?: CounterFactualAddressParam
  ): Promise<`0x${string}`> {
    if (this.accountAddress === null || this.accountAddress === undefined) {
      // means it needs deployment
      this.accountAddress = await this.getCounterFactualAddress(params);
    }
    return this.accountAddress ?? "0x";
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

    const maxIndexForScan = params?.maxIndexForScan ?? this.maxIndexForScan;
    // Review: default behavior
    const scanForUpgradedAccountsFromV1 =
      params?.scanForUpgradedAccountsFromV1 ??
      this.scanForUpgradedAccountsFromV1;

    // if it's intended to detect V1 upgraded accounts
    if (scanForUpgradedAccountsFromV1) {
      const eoaSigner = await validationModule.getSigner();
      const eoaAddress = (await eoaSigner.getAddress()) as Hex;
      const moduleAddress = validationModule.getAddress() as Hex;
      const moduleSetupData = (await validationModule.getInitData()) as Hex;
      const queryParams = {
        eoaAddress,
        index,
        moduleAddress,
        moduleSetupData,
        maxIndexForScan,
      };
      const accountAddress = await this.getV1AccountsUpgradedToV2(queryParams);
      if (accountAddress !== ADDRESS_ZERO) {
        return accountAddress;
      }
    }

    const counterFactualAddressV2 = await this.getCounterFactualAddressV2({
      validationModule,
      index,
    });
    return counterFactualAddressV2;
  }

  private async getCounterFactualAddressV2(
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
    GetContractReturnType<typeof BiconomyAccountAbi, PublicClient>
  > {
    if (this.accountContract === null) {
      this.accountContract = getContract({
        address: await this.getAddress(),
        abi: BiconomyAccountAbi,
        client: this.provider as PublicClient,
      });
    }
    return this.accountContract!;
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

  async getV1AccountsUpgradedToV2(
    params: QueryParamsForAddressResolver
  ): Promise<Hex> {
    const maxIndexForScan = params.maxIndexForScan ?? this.maxIndexForScan;

    const addressResolver = getContract({
      address: ADDRESS_RESOLVER_ADDRESS,
      abi: AccountResolverAbi,
      client: {
        public: this.provider as PublicClient,
      },
    });
    // Note: depending on moduleAddress and moduleSetupData passed call this. otherwise could call resolveAddresses()

    if (params.moduleAddress && params.moduleSetupData) {
      const result = await addressResolver.read.resolveAddressesFlexibleForV2([
        params.eoaAddress,
        maxIndexForScan,
        params.moduleAddress,
        params.moduleSetupData,
      ]);

      const desiredV1Account = result.find(
        (smartAccountInfo: {
          factoryVersion: string;
          currentVersion: string;
          deploymentIndex: { toString: () => any };
        }) =>
          smartAccountInfo.factoryVersion === "v1" &&
          smartAccountInfo.currentVersion === "2.0.0" &&
          Number(smartAccountInfo.deploymentIndex.toString()) === params.index
      );

      if (desiredV1Account) {
        const smartAccountAddress = desiredV1Account.accountAddress;
        return smartAccountAddress;
      } else {
        return ADDRESS_ZERO;
      }
    } else {
      return ADDRESS_ZERO;
    }
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

  override async encodeBatchExecute(
    txs: BatchUserOperationCallData
  ): Promise<Hex> {
    const [targets, datas, value] = txs.reduce(
      (accum, curr) => {
        accum[0].push(curr.target);
        accum[1].push(curr.data);
        accum[2].push(curr.value || BigInt(0));

        return accum;
      },
      [[], [], []] as [Hex[], Hex[], bigint[]]
    );

    return this.encodeExecuteBatch(targets, value, datas);
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
    userOp: Partial<UserOperationStruct>,
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
    userOp: Partial<UserOperationStruct>,
    params?: SendUserOpParams
  ): Promise<UserOperationStruct> {
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
    return userOp as UserOperationStruct;
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

  public async getPaymasterUserOp(
    userOp: Partial<UserOperationStruct>,
    paymasterServiceData: PaymasterUserOperationDto
  ): Promise<Partial<UserOperationStruct>> {
    if (paymasterServiceData.mode === PaymasterMode.SPONSORED) {
      return this.getPaymasterAndData(userOp, paymasterServiceData);
    } else if (paymasterServiceData.mode === PaymasterMode.ERC20) {
      if (paymasterServiceData?.feeQuote) {
        const { feeQuote, spender, maxApproval = false } = paymasterServiceData;
        Logger.log("there is a feeQuote: ", feeQuote);
        if (!spender) throw new Error(ERROR_MESSAGES.SPENDER_REQUIRED);
        if (!feeQuote) throw new Error(ERROR_MESSAGES.FAILED_FEE_QUOTE_FETCH);
        const partialUserOp = await this.buildTokenPaymasterUserOp(userOp, {
          ...paymasterServiceData,
          spender,
          maxApproval,
          feeQuote,
        });
        return this.getPaymasterAndData(partialUserOp, {
          ...paymasterServiceData,
          feeTokenAddress: feeQuote.tokenAddress,
          calculateGasLimits: true, // Always recommended and especially when using token paymaster
        });
      } else if (paymasterServiceData?.preferredToken) {
        const { preferredToken } = paymasterServiceData;
        Logger.log("there is a preferred token: ", preferredToken);
        const feeQuotesResponse = await this.getPaymasterFeeQuotesOrData(
          userOp,
          paymasterServiceData
        );
        const spender = feeQuotesResponse.tokenPaymasterAddress;
        const feeQuote = feeQuotesResponse.feeQuotes?.[0];
        if (!spender) throw new Error(ERROR_MESSAGES.SPENDER_REQUIRED);
        if (!feeQuote) throw new Error(ERROR_MESSAGES.FAILED_FEE_QUOTE_FETCH);
        return this.getPaymasterUserOp(userOp, {
          ...paymasterServiceData,
          feeQuote,
          spender,
        }); // Recursively call getPaymasterUserOp with the feeQuote
      } else {
        Logger.log(
          "ERC20 mode without feeQuote or preferredToken provided. Passing through unchanged."
        );
        return userOp;
      }
    }
    throw new Error("Invalid paymaster mode");
  }

  private async getPaymasterAndData(
    userOp: Partial<UserOperationStruct>,
    paymasterServiceData: PaymasterUserOperationDto
  ): Promise<Partial<UserOperationStruct>> {
    const paymaster = this
      .paymaster as IHybridPaymaster<PaymasterUserOperationDto>;
    const paymasterData = await paymaster.getPaymasterAndData(
      userOp,
      paymasterServiceData
    );
    return { ...userOp, ...paymasterData };
  }

  private async getPaymasterFeeQuotesOrData(
    userOp: Partial<UserOperationStruct>,
    feeQuotesOrData: FeeQuotesOrDataDto
  ): Promise<FeeQuotesOrDataResponse> {
    const paymaster = this
      .paymaster as IHybridPaymaster<PaymasterUserOperationDto>;
    const tokenList = feeQuotesOrData?.preferredToken
      ? [feeQuotesOrData?.preferredToken]
      : feeQuotesOrData?.tokenList?.length
      ? feeQuotesOrData?.tokenList
      : [];
    return paymaster.getPaymasterFeeQuotesOrData(userOp, {
      ...feeQuotesOrData,
      tokenList,
    });
  }

  /**
   *
   * @description This function will retrieve fees from the paymaster in erc20 mode
   *
   * @param manyOrOneTransactions Array of {@link Transaction} to be batched and sent. Can also be a single {@link Transaction}.
   * @param buildUseropDto {@link BuildUserOpOptions}.
   * @returns Promise<FeeQuotesOrDataResponse>
   *
   * @example
   * import { createClient } from "viem"
   * import { createSmartAccountClient } from "@biconomy/account"
   * import { createWalletClient, http } from "viem";
   * import { polygonMumbai } from "viem/chains";
   *
   * const signer = createWalletClient({
   *   account,
   *   chain: polygonMumbai,
   *   transport: http(),
   * });
   *
   * const smartAccount = await createSmartAccountClient({ signer, bundlerUrl }); // Retrieve bundler url from dasboard
   * const encodedCall = encodeFunctionData({
   *   abi: parseAbi(["function safeMint(address to) public"]),
   *   functionName: "safeMint",
   *   args: ["0x..."],
   * });
   *
   * const transaction = {
   *   to: nftAddress,
   *   data: encodedCall
   * }
   *
   * const feeQuotesResponse: FeeQuotesOrDataResponse = await smartAccount.getTokenFees(transaction, { paymasterServiceData: { mode: PaymasterMode.ERC20 } });
   *
   * const userSeletedFeeQuote = feeQuotesResponse.feeQuotes?.[0];
   *
   * const { wait } = await smartAccount.sendTransaction(transaction, {
   *    paymasterServiceData: {
   *      mode: PaymasterMode.ERC20,
   *      feeQuote: userSeletedFeeQuote,
   *      spender: feeQuotesResponse.tokenPaymasterAddress,
   *    },
   * });
   *
   * const { receipt } = await wait();
   *
   */
  public async getTokenFees(
    manyOrOneTransactions: Transaction | Transaction[],
    buildUseropDto: BuildUserOpOptions
  ): Promise<FeeQuotesOrDataResponse> {
    const txs = Array.isArray(manyOrOneTransactions)
      ? manyOrOneTransactions
      : [manyOrOneTransactions];
    const userOp = await this.buildUserOp(txs, buildUseropDto);
    if (!buildUseropDto.paymasterServiceData)
      throw new Error("paymasterServiceData was not provided");
    return this.getPaymasterFeeQuotesOrData(
      userOp,
      buildUseropDto.paymasterServiceData
    );
  }

  /**
   *
   * @param userOp
   * @param params
   * @description This function will take a user op as an input, sign it with the owner key, and send it to the bundler.
   * @returns Promise<UserOpResponse>
   * Sends a user operation
   *
   * - Docs: https://docs.biconomy.io/Account/transactions/userpaid#send-useroperation
   *
   * @param userOp Partial<{@link UserOperationStruct}> the userOp params to be sent.
   * @param params {@link SendUserOpParams}.
   * @returns Promise<{@link UserOpResponse}> that you can use to track user operation.
   *
   * @example
   * import { createClient } from "viem"
   * import { createSmartAccountClient } from "@biconomy/account"
   * import { createWalletClient, http } from "viem";
   * import { polygonMumbai } from "viem/chains";
   *
   * const signer = createWalletClient({
   *   account,
   *   chain: polygonMumbai,
   *   transport: http(),
   * });
   *
   * const smartAccount = await createSmartAccountClient({ signer, bundlerUrl }); // Retrieve bundler url from dasboard
   * const encodedCall = encodeFunctionData({
   *   abi: parseAbi(["function safeMint(address to) public"]),
   *   functionName: "safeMint",
   *   args: ["0x..."],
   * });
   *
   * const transaction = {
   *   to: nftAddress,
   *   data: encodedCall
   * }
   *
   * const userOp = await smartAccount.buildUserOp([transaction]);
   *
   * const { wait } = await smartAccount.sendUserOp(userOp);
   * const { receipt } = await wait();
   *
   */
  async sendUserOp(
    userOp: Partial<UserOperationStruct>,
    params?: SendUserOpParams
  ): Promise<UserOpResponse> {
    delete userOp.signature;
    const userOperation = await this.signUserOp(userOp, params);
    const bundlerResponse = await this.sendSignedUserOp(
      userOperation,
      params?.simulationType
    );
    return bundlerResponse;
  }

  /**
   *
   * @param userOp - The signed user operation to send
   * @param simulationType - The type of simulation to perform ("validation" | "validation_and_execution")
   * @description This function call will take 'signedUserOp' as input and send it to the bundler
   * @returns
   */
  async sendSignedUserOp(
    userOp: UserOperationStruct,
    simulationType?: SimulationType
  ): Promise<UserOpResponse> {
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
    if (!this.bundler) throw new Error("Bundler is not provided");
    Logger.warn("userOp being sent to the bundler", userOp);
    const bundlerResponse = await this.bundler.sendUserOp(
      userOp,
      simulationType
    );
    return bundlerResponse;
  }

  async getUserOpHash(userOp: Partial<UserOperationStruct>): Promise<Hex> {
    const userOpHash = keccak256(packUserOp(userOp, true) as Hex);
    const enc = encodeAbiParameters(
      parseAbiParameters("bytes32, address, uint256"),
      [userOpHash, this.entryPoint.address, BigInt(this.chainId)]
    );
    return keccak256(enc);
  }

  async estimateUserOpGas(
    userOp: Partial<UserOperationStruct>
  ): Promise<Partial<UserOperationStruct>> {
    if (!this.bundler) throw new Error("Bundler is not provided");
    const requiredFields: UserOperationKey[] = [
      "sender",
      "nonce",
      "initCode",
      "callData",
    ];
    this.validateUserOp(userOp, requiredFields);

    const finalUserOp = userOp;

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
    if (!finalUserOp.paymasterAndData) {
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
      Logger.warn(
        "Error while getting nonce for the account. This is expected for undeployed accounts set nonce to 0"
      );
    }
    return nonce;
  }

  /**
   * Sends a transaction (builds and sends a user op in sequence)
   *
   * - Docs: https://docs.biconomy.io/Account/transactions/userpaid#send-transaction
   *
   * @param manyOrOneTransactions Array of {@link Transaction} to be batched and sent. Can also be a single {@link Transaction}.
   * @param buildUseropDto {@link BuildUserOpOptions}.
   * @returns Promise<{@link UserOpResponse}> that you can use to track user operation.
   *
   * @example
   * import { createClient } from "viem"
   * import { createSmartAccountClient } from "@biconomy/account"
   * import { createWalletClient, http } from "viem";
   * import { polygonMumbai } from "viem/chains";
   *
   * const signer = createWalletClient({
   *   account,
   *   chain: polygonMumbai,
   *   transport: http(),
   * });
   *
   * const smartAccount = await createSmartAccountClient({ signer, bundlerUrl }); // Retrieve bundler url from dasboard
   * const encodedCall = encodeFunctionData({
   *   abi: parseAbi(["function safeMint(address to) public"]),
   *   functionName: "safeMint",
   *   args: ["0x..."],
   * });
   *
   * const transaction = {
   *   to: nftAddress,
   *   data: encodedCall
   * }
   *
   * const { waitForTxHash } = await smartAccount.sendTransaction(transaction);
   * const { transactionHash, userOperationReceipt } = await wait();
   *
   */
  async sendTransaction(
    manyOrOneTransactions: Transaction | Transaction[],
    buildUseropDto?: BuildUserOpOptions
  ): Promise<UserOpResponse> {
    const userOp = await this.buildUserOp(
      Array.isArray(manyOrOneTransactions)
        ? manyOrOneTransactions
        : [manyOrOneTransactions],
      buildUseropDto
    );
    return this.sendUserOp(userOp, {
      simulationType: buildUseropDto?.simulationType,
      ...buildUseropDto?.params,
    });
  }

  /**
   * Builds a user operation
   *
   * - Docs: https://docs.biconomy.io/Account/transactions/userpaid#build-useroperation
   *
   * @param transactions Array of {@link Transaction} to be sent.
   * @param buildUseropDto {@link BuildUserOpOptions}.
   * @returns Promise<Partial{@link UserOperationStruct}>> the built user operation to be sent.
   *
   * @example
   * import { createClient } from "viem"
   * import { createSmartAccountClient } from "@biconomy/account"
   * import { createWalletClient, http } from "viem";
   * import { polygonMumbai } from "viem/chains";
   *
   * const signer = createWalletClient({
   *   account,
   *   chain: polygonMumbai,
   *   transport: http(),
   * });
   *
   * const smartAccount = await createSmartAccountClient({ signer, bundlerUrl }); // Retrieve bundler url from dasboard
   * const encodedCall = encodeFunctionData({
   *   abi: parseAbi(["function safeMint(address to) public"]),
   *   functionName: "safeMint",
   *   args: ["0x..."],
   * });
   *
   * const transaction = {
   *   to: nftAddress,
   *   data: encodedCall
   * }
   *
   * const userOp = await smartAccount.buildUserOp([{ to: "0x...", data: encodedCall }]);
   *
   */
  async buildUserOp(
    transactions: Transaction[],
    buildUseropDto?: BuildUserOpOptions
  ): Promise<Partial<UserOperationStruct>> {
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

    const [nonceFromFetch, initCode, signature] = await Promise.all([
      this.getBuildUserOpNonce(buildUseropDto?.nonceOptions),
      initCodeFetchPromise,
      dummySignatureFetchPromise,
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

    let userOp: Partial<UserOperationStruct> = {
      sender: (await this.getAccountAddress()) as Hex,
      nonce: toHex(nonceFromFetch),
      initCode,
      callData: callData,
    };

    // for this Smart Account current validation module dummy signature will be used to estimate gas
    userOp.signature = signature;

    // Note: Can change the default behaviour of calling estimations using bundler/local
    userOp = await this.estimateUserOpGas(userOp);

    if (buildUseropDto?.paymasterServiceData) {
      userOp = await this.getPaymasterUserOp(
        userOp,
        buildUseropDto.paymasterServiceData
      );
    }

    Logger.log("UserOp after estimation ", userOp);

    return userOp;
  }

  private validateUserOpAndPaymasterRequest(
    userOp: Partial<UserOperationStruct>,
    tokenPaymasterRequest: BiconomyTokenPaymasterRequest
  ): void {
    if (isNullOrUndefined(userOp.callData)) {
      throw new Error("UserOp callData cannot be undefined");
    }

    const feeTokenAddress = tokenPaymasterRequest?.feeQuote?.tokenAddress;
    Logger.warn("Requested fee token is ", feeTokenAddress);

    if (!feeTokenAddress || feeTokenAddress === ADDRESS_ZERO) {
      throw new Error(
        "Invalid or missing token address. Token address must be part of the feeQuote in tokenPaymasterRequest"
      );
    }

    const spender = tokenPaymasterRequest?.spender;
    Logger.warn("Spender address is ", spender);

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
    userOp: Partial<UserOperationStruct>,
    tokenPaymasterRequest: BiconomyTokenPaymasterRequest
  ): Promise<Partial<UserOperationStruct>> {
    this.validateUserOpAndPaymasterRequest(userOp, tokenPaymasterRequest);
    try {
      let batchTo: Array<Hex> = [];
      let batchValue: Array<bigint> = [];
      let batchData: Array<Hex> = [];

      let newCallData = userOp.callData;
      Logger.warn(
        "Received information about fee token address and quote ",
        tokenPaymasterRequest
      );

      if (this.paymaster && this.paymaster instanceof Paymaster) {
        // Make a call to paymaster.buildTokenApprovalTransaction() with necessary details

        // Review: might request this form of an array of Transaction
        const approvalRequest: Transaction = await (
          this.paymaster as IHybridPaymaster<SponsorUserOperationDto>
        ).buildTokenApprovalTransaction(tokenPaymasterRequest);
        Logger.warn("ApprovalRequest is for erc20 token ", approvalRequest.to);

        if (
          approvalRequest.data === "0x" ||
          approvalRequest.to === ADDRESS_ZERO
        ) {
          return userOp;
        }

        if (isNullOrUndefined(userOp.callData)) {
          throw new Error("UserOp callData cannot be undefined");
        }

        const decodedSmartAccountData = decodeFunctionData({
          abi: BiconomyAccountAbi,
          data: userOp.callData as Hex,
        });

        if (!decodedSmartAccountData) {
          throw new Error(
            "Could not parse userOp call data for this smart account"
          );
        }

        const smartAccountExecFunctionName =
          decodedSmartAccountData.functionName;

        Logger.warn(
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
        const finalUserOp: Partial<UserOperationStruct> = {
          ...userOp,
          callData: newCallData,
        };

        // Optionally Requesting to update gas limits again (especially callGasLimit needs to be re-calculated)

        return finalUserOp;
      }
    } catch (error) {
      Logger.log("Failed to update userOp. Sending back original op");
      Logger.error("Failed to update callData with error", error);
      return userOp;
    }
    return userOp;
  }

  async signUserOpHash(userOpHash: string, params?: ModuleInfo): Promise<Hex> {
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
      value: "0x00",
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
      value: "0x00",
      data: callData,
    };
    return tx;
  }

  async disableModule(
    prevModule: Hex,
    moduleAddress: Hex
  ): Promise<UserOpResponse> {
    const tx: Transaction = await this.getDisableModuleData(
      prevModule,
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
      value: "0x00",
      data: callData,
    };
    return tx;
  }

  async isModuleEnabled(moduleAddress: Hex): Promise<boolean> {
    const accountContract = await this._getAccountContract();
    return accountContract.read.isModuleEnabled([moduleAddress]);
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

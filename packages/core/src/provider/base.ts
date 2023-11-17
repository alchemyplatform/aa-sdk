import { default as EventEmitter } from "eventemitter3";
import {
  fromHex,
  toHex,
  type Address,
  type Chain,
  type Hash,
  type HttpTransport,
  type RpcTransactionRequest,
  type Transaction,
  type Transport,
} from "viem";
import { arbitrum, arbitrumGoerli, arbitrumSepolia } from "viem/chains";
import type {
  ISmartContractAccount,
  SignTypedDataParams,
} from "../account/types.js";
import { createPublicErc4337Client } from "../client/create-client.js";
import type {
  PublicErc4337Client,
  SupportedTransports,
} from "../client/types.js";
import {
  type BatchUserOperationCallData,
  type UserOperationCallData,
  type UserOperationOverrides,
  type UserOperationReceipt,
  type UserOperationRequest,
  type UserOperationResponse,
  type UserOperationStruct,
} from "../types.js";
import {
  asyncPipe,
  bigIntMax,
  bigIntPercent,
  deepHexlify,
  defineReadOnly,
  getDefaultEntryPointAddress,
  getUserOperationHash,
  isValidRequest,
  resolveProperties,
  type Deferrable,
} from "../utils/index.js";
import { createSmartAccountProviderConfigSchema } from "./schema.js";
import type {
  AccountMiddlewareFn,
  AccountMiddlewareOverrideFn,
  FeeDataMiddleware,
  GasEstimatorMiddleware,
  ISmartAccountProvider,
  PaymasterAndDataMiddleware,
  ProviderEvents,
  SendUserOperationResult,
  SmartAccountProviderConfig,
} from "./types.js";

export const noOpMiddleware: AccountMiddlewareFn = async (
  struct: Deferrable<UserOperationStruct>
) => struct;

const minPriorityFeePerBidDefaults = new Map<number, bigint>([
  [arbitrum.id, 10_000_000n],
  [arbitrumGoerli.id, 10_000_000n],
  [arbitrumSepolia.id, 10_000_000n],
]);

export class SmartAccountProvider<
    TTransport extends SupportedTransports = Transport
  >
  extends EventEmitter<ProviderEvents>
  implements ISmartAccountProvider<TTransport>
{
  private txMaxRetries: number;
  private txRetryIntervalMs: number;
  private txRetryMulitplier: number;

  private minPriorityFeePerBid: bigint;
  private maxPriorityFeePerGasEstimateBuffer: number;

  readonly account?: ISmartContractAccount;

  protected entryPointAddress?: Address;
  protected chain: Chain;

  rpcClient:
    | PublicErc4337Client<TTransport>
    | PublicErc4337Client<HttpTransport>;

  constructor(config: SmartAccountProviderConfig<TTransport>) {
    createSmartAccountProviderConfigSchema<TTransport>().parse(config);

    const { rpcProvider, entryPointAddress, chain, opts } = config;

    super();

    this.chain = chain;

    this.txMaxRetries = opts?.txMaxRetries ?? 5;
    this.txRetryIntervalMs = opts?.txRetryIntervalMs ?? 2000;
    this.txRetryMulitplier = opts?.txRetryMulitplier ?? 1.5;
    this.entryPointAddress = entryPointAddress;

    this.minPriorityFeePerBid =
      opts?.minPriorityFeePerBid ??
      minPriorityFeePerBidDefaults.get(chain.id) ??
      100_000_000n;

    this.maxPriorityFeePerGasEstimateBuffer =
      opts?.maxPriorityFeePerGasEstimateBuffer ?? 33;

    this.rpcClient =
      typeof rpcProvider === "string"
        ? createPublicErc4337Client({
            chain,
            rpcUrl: rpcProvider,
          })
        : rpcProvider;
  }

  request: (args: { method: string; params?: any[] }) => Promise<any> = async (
    args
  ) => {
    const { method, params } = args;
    switch (method) {
      case "eth_sendTransaction":
        const [tx] = params as [RpcTransactionRequest];
        return this.sendTransaction(tx);
      case "eth_sign":
        const [address, data] = params!;
        if (address !== (await this.getAddress())) {
          throw new Error(
            "cannot sign for address that is not the current account"
          );
        }
        return this.signMessage(data);
      case "personal_sign": {
        const [data, address] = params!;
        if (address !== (await this.getAddress())) {
          throw new Error(
            "cannot sign for address that is not the current account"
          );
        }
        return this.signMessage(data);
      }
      case "eth_signTypedData_v4": {
        const [address, dataParams] = params!;
        if (address !== (await this.getAddress())) {
          throw new Error(
            "cannot sign for address that is not the current account"
          );
        }
        return this.signTypedData(dataParams);
      }
      case "eth_chainId":
        return this.chain.id;
      default:
        // TODO: there's probably a number of methods we just don't support, will need to test most of them out
        // first let's get something working though
        // @ts-expect-error the typing with viem clashes here, we'll need to fix the typing on this method
        return this.rpcClient.request(args);
    }
  };

  getAddress = (): Promise<`0x${string}`> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.getAddress();
  };

  signMessage = async (msg: string | Uint8Array): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }
    return this.account.signMessage(msg);
  };

  signTypedData = async (params: SignTypedDataParams): Promise<Hash> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.signTypedData(params);
  };

  signMessageWith6492 = (msg: string | Uint8Array): Promise<`0x${string}`> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.signMessageWith6492(msg);
  };

  signTypedDataWith6492 = (
    params: SignTypedDataParams
  ): Promise<`0x${string}`> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.signTypedDataWith6492(params);
  };

  sendTransaction = async (
    request: RpcTransactionRequest,
    overrides?: UserOperationOverrides
  ): Promise<Hash> => {
    const uoStruct = await this.buildUserOperationFromTx(request, overrides);

    const { hash } = await this._sendUserOperation(uoStruct);

    return await this.waitForUserOperationTransaction(hash as Hash);
  };

  buildUserOperationFromTx = async (
    request: RpcTransactionRequest,
    overrides?: UserOperationOverrides
  ): Promise<UserOperationStruct> => {
    if (!request.to) {
      throw new Error("transaction is missing to address");
    }

    const _overrides: UserOperationOverrides = {};
    if (overrides?.maxFeePerGas || request.maxFeePerGas) {
      _overrides.maxFeePerGas = overrides?.maxFeePerGas ?? request.maxFeePerGas;
    }
    if (overrides?.maxPriorityFeePerGas || request.maxPriorityFeePerGas) {
      _overrides.maxPriorityFeePerGas =
        overrides?.maxPriorityFeePerGas ?? request.maxPriorityFeePerGas;
    }
    _overrides.paymasterAndData = overrides?.paymasterAndData;

    return this.buildUserOperation(
      {
        target: request.to,
        data: request.data ?? "0x",
        value: request.value ? fromHex(request.value, "bigint") : 0n,
      },
      _overrides
    );
  };

  buildUserOperationFromTxs = (
    requests: RpcTransactionRequest[],
    overrides?: UserOperationOverrides
  ) => {
    const batch = requests.map((request) => {
      if (!request.to) {
        throw new Error(
          "one transaction in the batch is missing a target address"
        );
      }

      return {
        target: request.to,
        data: request.data ?? "0x",
        value: request.value ? fromHex(request.value, "bigint") : 0n,
      };
    });

    const maxFeePerGas = bigIntMax(
      ...requests
        .filter((x) => x.maxFeePerGas != null)
        .map((x) => fromHex(x.maxFeePerGas!, "bigint"))
    );

    const maxPriorityFeePerGas = bigIntMax(
      ...requests
        .filter((x) => x.maxPriorityFeePerGas != null)
        .map((x) => fromHex(x.maxPriorityFeePerGas!, "bigint"))
    );
    const _overrides: UserOperationOverrides = {};
    if (overrides?.maxFeePerGas || maxFeePerGas != null) {
      _overrides.maxFeePerGas = overrides?.maxFeePerGas ?? maxFeePerGas;
    }

    if (overrides?.maxPriorityFeePerGas || maxPriorityFeePerGas != null) {
      _overrides.maxPriorityFeePerGas =
        overrides?.maxPriorityFeePerGas ?? maxPriorityFeePerGas;
    }

    return {
      batch,
      overrides,
    };
  };

  sendTransactions = async (
    requests: RpcTransactionRequest[],
    overrides?: UserOperationOverrides
  ) => {
    const { batch, overrides: _overrides } = this.buildUserOperationFromTxs(
      requests,
      overrides
    );

    const { hash } = await this.sendUserOperation(batch, _overrides);

    return await this.waitForUserOperationTransaction(hash as Hash);
  };

  waitForUserOperationTransaction = async (hash: Hash): Promise<Hash> => {
    for (let i = 0; i < this.txMaxRetries; i++) {
      const txRetryIntervalWithJitterMs =
        this.txRetryIntervalMs * Math.pow(this.txRetryMulitplier, i) +
        Math.random() * 100;

      await new Promise((resolve) =>
        setTimeout(resolve, txRetryIntervalWithJitterMs)
      );
      const receipt = await this.getUserOperationReceipt(hash as `0x${string}`)
        // TODO: should maybe log the error?
        .catch(() => null);
      if (receipt) {
        return this.getTransaction(receipt.receipt.transactionHash).then(
          (x) => x.hash
        );
      }
    }

    throw new Error("Failed to find transaction for User Operation");
  };

  getUserOperationByHash = (
    hash: Hash
  ): Promise<UserOperationResponse | null> => {
    return this.rpcClient.getUserOperationByHash(hash);
  };

  getUserOperationReceipt = (
    hash: Hash
  ): Promise<UserOperationReceipt | null> => {
    return this.rpcClient.getUserOperationReceipt(hash);
  };

  getTransaction = (hash: Hash): Promise<Transaction> => {
    return this.rpcClient.getTransaction({ hash: hash });
  };

  buildUserOperation = async (
    data: UserOperationCallData | BatchUserOperationCallData,
    overrides?: UserOperationOverrides
  ) => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    const initCode = await this.account.getInitCode();
    return this._runMiddlewareStack(
      {
        initCode,
        sender: this.getAddress(),
        nonce: this.account.getNonce(),
        callData: Array.isArray(data)
          ? this.account.encodeBatchExecute(data)
          : this.account.encodeExecute(
              data.target,
              data.value ?? 0n,
              data.data
            ),
        signature: this.account.getDummySignature(),
      } as Deferrable<UserOperationStruct>,
      overrides
    );
  };

  sendUserOperation = async (
    data: UserOperationCallData | BatchUserOperationCallData,
    overrides?: UserOperationOverrides
  ): Promise<SendUserOperationResult> => {
    if (!this.account) {
      throw new Error("account not connected");
    }

    const uoStruct = await this.buildUserOperation(data, overrides);
    return this._sendUserOperation(uoStruct);
  };

  dropAndReplaceUserOperation = async (
    uoToDrop: UserOperationRequest,
    overrides?: UserOperationOverrides
  ): Promise<SendUserOperationResult> => {
    const uoToSubmit = {
      initCode: uoToDrop.initCode,
      sender: uoToDrop.sender,
      nonce: uoToDrop.nonce,
      callData: uoToDrop.callData,
      signature: uoToDrop.signature,
    } as UserOperationStruct;

    // Run once to get the fee estimates
    // This can happen at any part of the middleware stack, so we want to run it all
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this._runMiddlewareStack(uoToSubmit, overrides);

    const _overrides: UserOperationOverrides = {
      maxFeePerGas: bigIntMax(
        BigInt(maxFeePerGas ?? 0n),
        bigIntPercent(uoToDrop.maxFeePerGas, 110n)
      ),
      maxPriorityFeePerGas: bigIntMax(
        BigInt(maxPriorityFeePerGas ?? 0n),
        bigIntPercent(uoToDrop.maxPriorityFeePerGas, 110n)
      ),
      paymasterAndData: uoToDrop.paymasterAndData,
    };

    const uoToSend = await this._runMiddlewareStack(uoToSubmit, _overrides);
    return this._sendUserOperation(uoToSend);
  };

  checkGasSponsorshipEligibility = async (
    data: UserOperationCallData | BatchUserOperationCallData,
    overrides?: UserOperationOverrides
  ): Promise<boolean> => {
    return this.buildUserOperation(data, overrides)
      .then(
        (userOperationStruct: UserOperationStruct) =>
          userOperationStruct.paymasterAndData !== "0x" &&
          userOperationStruct.paymasterAndData !== null
      )
      .catch(() => false);
  };

  private _runMiddlewareStack = async (
    uo: Deferrable<UserOperationStruct>,
    overrides?: UserOperationOverrides
  ) => {
    const result = await asyncPipe(
      this.dummyPaymasterDataMiddleware,
      this.feeDataGetter,
      this.gasEstimator,
      // run this before paymaster middleware
      async (struct) => ({ ...struct, ...overrides }),
      this.customMiddleware,
      overrides?.paymasterAndData
        ? noOpMiddleware
        : this.paymasterDataMiddleware,
      this.simulateUOMiddleware
    )(uo);

    return resolveProperties<UserOperationStruct>(result);
  };

  private _sendUserOperation = async (uoStruct: UserOperationStruct) => {
    if (!this.account) {
      throw new Error("account not connected");
    }

    const request = deepHexlify(uoStruct);
    if (!isValidRequest(request)) {
      // this pretty prints the uo
      throw new Error(
        `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
          uoStruct,
          null,
          2
        )}`
      );
    }

    request.signature = (await this.account.signUserOperationHash(
      getUserOperationHash(
        request,
        this.getEntryPointAddress(),
        BigInt(this.chain.id)
      )
    )) as `0x${string}`;

    return {
      hash: await this.rpcClient.sendUserOperation(
        request,
        this.getEntryPointAddress()
      ),
      request,
    };
  };

  // These are dependent on the specific paymaster being used
  // You should implement your own middleware to override these
  // or extend this class and provider your own implemenation
  readonly dummyPaymasterDataMiddleware: AccountMiddlewareFn = async (
    struct
  ) => {
    struct.paymasterAndData = "0x";
    return struct;
  };

  readonly paymasterDataMiddleware: AccountMiddlewareFn = async (struct) => {
    struct.paymasterAndData = "0x";
    return struct;
  };

  readonly gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.getEntryPointAddress()
    );

    struct.callGasLimit = estimates.callGasLimit;
    struct.verificationGasLimit = estimates.verificationGasLimit;
    struct.preVerificationGas = estimates.preVerificationGas;

    return struct;
  };

  readonly feeDataGetter: AccountMiddlewareFn = async (struct) => {
    const [maxPriorityFeePerGas, feeData] = await Promise.all([
      this.rpcClient.estimateMaxPriorityFeePerGas(),
      this.rpcClient.estimateFeesPerGas(),
    ]);
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error(
        "feeData is missing maxFeePerGas or maxPriorityFeePerGas"
      );
    }

    // set maxPriorityFeePerGasBid to the max between 33% added priority fee estimate and
    // the min priority fee per gas set for the provider
    const maxPriorityFeePerGasBid = bigIntMax(
      bigIntPercent(
        maxPriorityFeePerGas,
        BigInt(100 + this.maxPriorityFeePerGasEstimateBuffer)
      ),
      this.minPriorityFeePerBid
    );

    const maxFeePerGasBid =
      BigInt(feeData.maxFeePerGas) -
      BigInt(feeData.maxPriorityFeePerGas) +
      maxPriorityFeePerGasBid;

    struct.maxFeePerGas = maxFeePerGasBid;
    struct.maxPriorityFeePerGas = maxPriorityFeePerGasBid;

    return struct;
  };

  readonly customMiddleware: AccountMiddlewareFn = noOpMiddleware;

  readonly simulateUOMiddleware: AccountMiddlewareFn = noOpMiddleware;

  withPaymasterMiddleware = (overrides: {
    dummyPaymasterDataMiddleware?: PaymasterAndDataMiddleware;
    paymasterDataMiddleware?: PaymasterAndDataMiddleware;
  }): this => {
    const newDummyMiddleware = overrides.dummyPaymasterDataMiddleware
      ? this.overrideMiddlewareFunction(overrides.dummyPaymasterDataMiddleware)
      : this.dummyPaymasterDataMiddleware;
    defineReadOnly(this, "dummyPaymasterDataMiddleware", newDummyMiddleware);

    const newPaymasterMiddleware = overrides.paymasterDataMiddleware
      ? this.overrideMiddlewareFunction(overrides.paymasterDataMiddleware)
      : this.paymasterDataMiddleware;
    defineReadOnly(this, "paymasterDataMiddleware", newPaymasterMiddleware);

    return this;
  };

  withGasEstimator = (override: GasEstimatorMiddleware): this => {
    defineReadOnly(
      this,
      "gasEstimator",
      this.overrideMiddlewareFunction(override)
    );
    return this;
  };

  withFeeDataGetter = (override: FeeDataMiddleware): this => {
    defineReadOnly(
      this,
      "feeDataGetter",
      this.overrideMiddlewareFunction(override)
    );
    return this;
  };

  withCustomMiddleware = (override: AccountMiddlewareFn): this => {
    defineReadOnly(this, "customMiddleware", override);

    return this;
  };

  withSimulateUOMiddleware = (override: AccountMiddlewareFn): this => {
    defineReadOnly(this, "simulateUOMiddleware", override);

    return this;
  };

  connect = <TAccount extends ISmartContractAccount>(
    fn: (
      provider:
        | PublicErc4337Client<TTransport>
        | PublicErc4337Client<HttpTransport>
    ) => TAccount
  ): this & { account: TAccount } => {
    const account = fn(this.rpcClient);

    // sanity check. Note that this check is only performed if and only if the optional entryPointAddress is given upon initialization.
    if (
      this.entryPointAddress &&
      account.getEntryPointAddress() !== this.entryPointAddress
    ) {
      throw new Error(
        `Account entryPoint address: ${account.getEntryPointAddress()} does not match the current provider's entryPoint address: ${
          this.entryPointAddress
        }`
      );
    }

    defineReadOnly(this, "account", account);

    if (this.rpcClient.transport.type === "http") {
      const { url = this.chain.rpcUrls.default.http[0], fetchOptions } = this
        .rpcClient.transport as ReturnType<HttpTransport>["config"] &
        ReturnType<HttpTransport>["value"];

      const signer = account.getOwner();
      const factoryAddress = account.getFactoryAddress();

      this.rpcClient = createPublicErc4337Client({
        chain: this.chain,
        rpcUrl: url,
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions?.headers,
            "Alchemy-Aa-Sdk-Signer": signer?.signerType || "unknown",
            "Alchemy-Aa-Sdk-Factory-Address": factoryAddress,
          },
        },
      });
    }

    this.emit("connect", {
      chainId: toHex(this.chain.id),
    });

    account
      .getAddress()
      .then((address) => this.emit("accountsChanged", [address]));

    return this as unknown as this & { account: TAccount };
  };

  disconnect = (): this & { account: undefined } => {
    if (this.account) {
      this.emit("disconnect");
      this.emit("accountsChanged", []);
    }

    defineReadOnly(this, "account", undefined);

    return this as this & { account: undefined };
  };

  isConnected = <TAccount extends ISmartContractAccount>(): this is this & {
    account: TAccount;
  } => {
    return this.account !== undefined;
  };

  /*
   * Note that the connected account's entryPointAddress always takes the precedence
   */
  getEntryPointAddress = (): Address => {
    return (
      this.entryPointAddress ??
      this.account?.getEntryPointAddress() ??
      getDefaultEntryPointAddress(this.chain)
    );
  };

  extend = <R>(fn: (self: this) => R): this & R => {
    const extended = fn(this) as any;
    // this should make it so extensions can't overwrite the base methods
    for (const key in this) {
      delete extended[key];
    }

    return Object.assign(this, extended);
  };

  private overrideMiddlewareFunction = (
    override: AccountMiddlewareOverrideFn
  ): AccountMiddlewareFn => {
    return async (struct) => {
      return {
        ...struct,
        ...(await override(struct)),
      };
    };
  };
}

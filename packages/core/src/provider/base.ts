import { default as EventEmitter } from "eventemitter3";
import {
  fromHex,
  toHex,
  type Address,
  type Chain,
  type Hash,
  type RpcTransactionRequest,
  type Transaction,
  type Transport,
} from "viem";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import { BaseSmartContractAccount } from "../account/base.js";
import type { SignTypedDataParams } from "../account/types.js";
import { createPublicErc4337Client } from "../client/create-client.js";
import type {
  PublicErc4337Client,
  SupportedTransports,
} from "../client/types.js";
import {
  isValidRequest,
  type BatchUserOperationCallData,
  type UserOperationCallData,
  type UserOperationOverrides,
  type UserOperationReceipt,
  type UserOperationResponse,
  type UserOperationStruct,
} from "../types.js";
import {
  asyncPipe,
  deepHexlify,
  defineReadOnly,
  getUserOperationHash,
  resolveProperties,
} from "../utils.js";
import type {
  AccountMiddlewareFn,
  AccountMiddlewareOverrideFn,
  FeeDataMiddleware,
  GasEstimatorMiddleware,
  ISmartAccountProvider,
  PaymasterAndDataMiddleware,
  ProviderEvents,
  SendUserOperationResult,
} from "./types.js";

export const noOpMiddleware: AccountMiddlewareFn = async (
  struct: UserOperationStruct
) => struct;
export interface SmartAccountProviderOpts {
  /**
   * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
   */
  txMaxRetries?: number;

  /**
   * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000n)
   */
  txRetryIntervalMs?: number;

  /**
   * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
   */
  txRetryMulitplier?: number;

  /**
   * used when computing the fees for a user operation (default: 100_000_000n)
   */
  minPriorityFeePerBid?: bigint;
}

const minPriorityFeePerBidDefaults = new Map<number, bigint>([
  [arbitrum.id, 10_000_000n],
  [arbitrumGoerli.id, 10_000_000n],
]);

export type ConnectedSmartAccountProvider<
  TTransport extends SupportedTransports = Transport
> = SmartAccountProvider<TTransport> & {
  account: BaseSmartContractAccount<TTransport>;
};

export class SmartAccountProvider<
    TTransport extends SupportedTransports = Transport
  >
  extends EventEmitter<ProviderEvents>
  implements ISmartAccountProvider<TTransport>
{
  private txMaxRetries: number;
  private txRetryIntervalMs: number;
  private txRetryMulitplier: number;

  minPriorityFeePerBid: bigint;
  rpcClient: PublicErc4337Client<Transport>;

  constructor(
    rpcProvider: string | PublicErc4337Client<TTransport>,
    protected entryPointAddress: Address,
    protected chain: Chain,
    readonly account?: BaseSmartContractAccount<TTransport>,
    opts?: SmartAccountProviderOpts
  ) {
    super();

    this.txMaxRetries = opts?.txMaxRetries ?? 5;
    this.txRetryIntervalMs = opts?.txRetryIntervalMs ?? 2000;
    this.txRetryMulitplier = opts?.txRetryMulitplier ?? 1.5;

    this.minPriorityFeePerBid =
      opts?.minPriorityFeePerBid ??
      minPriorityFeePerBidDefaults.get(chain.id) ??
      100_000_000n;

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
      // TODO: will probably need to handle typed message signing too?
      case "eth_sign":
      case "personal_sign":
        const [data, address] = params!;
        if (address !== (await this.getAddress())) {
          throw new Error(
            "cannot sign for address that is not the current account"
          );
        }
        return this.signMessage(data);
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

  sendTransaction = async (request: RpcTransactionRequest): Promise<Hash> => {
    if (!request.to) {
      throw new Error("transaction is missing to address");
    }

    const overrides: UserOperationOverrides = {};
    if (request.maxFeePerGas) {
      overrides.maxFeePerGas = request.maxFeePerGas;
    }
    if (request.maxPriorityFeePerGas) {
      overrides.maxPriorityFeePerGas = request.maxPriorityFeePerGas;
    }

    const { hash } = await this.sendUserOperation(
      {
        target: request.to,
        data: request.data ?? "0x",
        value: request.value ? fromHex(request.value, "bigint") : 0n,
      },
      overrides
    );

    return await this.waitForUserOperationTransaction(hash as Hash);
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

  signMessageWith6492(msg: string | Uint8Array): Promise<`0x${string}`> {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.signMessageWith6492(msg);
  }

  signTypedDataWith6492(params: SignTypedDataParams): Promise<`0x${string}`> {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    return this.account.signTypedDataWith6492(params);
  }

  sendTransactions = async (requests: RpcTransactionRequest[]) => {
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

    const bigIntMax = (...args: bigint[]) => {
      if (!args.length) {
        return undefined;
      }

      return args.reduce((m, c) => (m > c ? m : c));
    };

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
    const overrides: UserOperationOverrides = {};
    if (maxFeePerGas != null) {
      overrides.maxFeePerGas = maxFeePerGas;
    }

    if (maxPriorityFeePerGas != null) {
      overrides.maxPriorityFeePerGas = maxPriorityFeePerGas;
    }

    const { hash } = await this.sendUserOperation(batch, overrides);

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

  getUserOperationByHash = (hash: Hash): Promise<UserOperationResponse> => {
    return this.rpcClient.getUserOperationByHash(hash);
  };

  getUserOperationReceipt = (hash: Hash): Promise<UserOperationReceipt> => {
    return this.rpcClient.getUserOperationReceipt(hash);
  };

  getTransaction = (hash: Hash): Promise<Transaction> => {
    return this.rpcClient.getTransaction({ hash: hash });
  };

  sendUserOperation = async (
    data: UserOperationCallData | BatchUserOperationCallData,
    overrides?: UserOperationOverrides
  ): Promise<SendUserOperationResult> => {
    if (!this.account) {
      throw new Error("account not connected!");
    }

    const initCode = await this.account.getInitCode();
    const uoStruct = await asyncPipe(
      this.dummyPaymasterDataMiddleware,
      this.feeDataGetter,
      this.gasEstimator,
      this.paymasterDataMiddleware,
      this.customMiddleware ?? noOpMiddleware,
      // This applies the overrides if they've been passed in
      async (struct) => ({ ...struct, ...overrides })
    )({
      initCode,
      sender: this.getAddress(),
      nonce: this.account.getNonce(),
      callData: Array.isArray(data)
        ? this.account.encodeBatchExecute(data)
        : this.account.encodeExecute(data.target, data.value ?? 0n, data.data),
      signature: this.account.getDummySignature(),
    } as UserOperationStruct);

    const request = deepHexlify(await resolveProperties(uoStruct));
    if (!isValidRequest(request)) {
      // this pretty prints the uo
      throw new Error(
        `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
          request,
          null,
          2
        )}`
      );
    }

    request.signature = (await this.account.signMessage(
      getUserOperationHash(
        request,
        this.entryPointAddress as `0x${string}`,
        BigInt(this.chain.id)
      )
    )) as `0x${string}`;

    return {
      hash: await this.rpcClient.sendUserOperation(
        request,
        this.entryPointAddress
      ),
      request,
    };
  };

  // These are dependent on the specific paymaster being used
  // You should implement your own middleware to override these
  // or extend this class and provider your own implemenation
  readonly dummyPaymasterDataMiddleware: AccountMiddlewareFn = async (
    struct: UserOperationStruct
  ): Promise<UserOperationStruct> => {
    struct.paymasterAndData = "0x";
    return struct;
  };

  readonly paymasterDataMiddleware: AccountMiddlewareFn = async (
    struct: UserOperationStruct
  ): Promise<UserOperationStruct> => {
    struct.paymasterAndData = "0x";
    return struct;
  };

  readonly gasEstimator: AccountMiddlewareFn = async (struct) => {
    const request = deepHexlify(await resolveProperties(struct));
    const estimates = await this.rpcClient.estimateUserOperationGas(
      request,
      this.entryPointAddress
    );

    struct.callGasLimit = estimates.callGasLimit;
    struct.verificationGasLimit = estimates.verificationGasLimit;
    struct.preVerificationGas = estimates.preVerificationGas;

    return struct;
  };

  readonly feeDataGetter: AccountMiddlewareFn = async (struct) => {
    const maxPriorityFeePerGas = await this.rpcClient.getMaxPriorityFeePerGas();
    const feeData = await this.rpcClient.getFeeData();
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error(
        "feeData is missing maxFeePerGas or maxPriorityFeePerGas"
      );
    }

    // add 33% to the priorty fee to ensure the transaction is mined
    let maxPriorityFeePerGasBid = (BigInt(maxPriorityFeePerGas) * 4n) / 3n;
    if (maxPriorityFeePerGasBid < this.minPriorityFeePerBid) {
      maxPriorityFeePerGasBid = this.minPriorityFeePerBid;
    }

    const maxFeePerGasBid =
      BigInt(feeData.maxFeePerGas) -
      BigInt(feeData.maxPriorityFeePerGas) +
      maxPriorityFeePerGasBid;

    struct.maxFeePerGas = maxFeePerGasBid;
    struct.maxPriorityFeePerGas = maxPriorityFeePerGasBid;

    return struct;
  };

  readonly customMiddleware?: AccountMiddlewareFn | undefined = undefined;

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

  connect(
    fn: (provider: PublicErc4337Client<TTransport>) => BaseSmartContractAccount
  ): this & { account: BaseSmartContractAccount } {
    const account = fn(this.rpcClient);
    defineReadOnly(this, "account", account);

    this.emit("connect", {
      chainId: toHex(this.chain.id),
    });

    account
      .getAddress()
      .then((address) => this.emit("accountsChanged", [address]));

    return this as this & { account: typeof account };
  }

  disconnect(): this & { account: undefined } {
    if (this.account) {
      this.emit("disconnect");
      this.emit("accountsChanged", []);
    }

    defineReadOnly(this, "account", undefined);

    return this as this & { account: undefined };
  }

  isConnected(): this is ConnectedSmartAccountProvider<TTransport> {
    return this.account !== undefined;
  }

  private overrideMiddlewareFunction = (
    override: AccountMiddlewareOverrideFn
  ): AccountMiddlewareFn => {
    return async (struct: UserOperationStruct) => {
      return {
        ...struct,
        ...(await override(struct)),
      };
    };
  };
}

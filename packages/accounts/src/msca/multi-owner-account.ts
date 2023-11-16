import {
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hashMessage,
  hashTypedData,
  isBytes,
  toBytes,
  type FallbackTransport,
  type Hash,
  type Transport,
} from "viem";
import { z } from "zod";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import { BaseModularSmartContractAccount } from "./base.js";
import { MultiOwnerPluginExecutionFunctionAbi } from "./plugins/multi-owner.js";

export const createMultiOwnerMSCASchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    index: z.bigint().optional().default(0n),
  });

export type MultiOwnerMSCAParams = z.input<
  ReturnType<typeof createMultiOwnerMSCASchema>
>;

export class MultiOwnerMSCA<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseModularSmartContractAccount<TTransport> {
  owner: SmartAccountSigner;
  private index: bigint;

  constructor(params_: MultiOwnerMSCAParams) {
    const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);
    super(params);

    this.owner = params.owner;
    this.index = params.index;
  }

  getDummySignature(): `0x${string}` {
    return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
  }

  signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
    return this.owner.signMessage(uoHash);
  }

  signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
    return this.signWith1271Wrapper(
      hashMessage(
        typeof msg === "string" && !isBytes(msg)
          ? msg
          : {
              raw: msg,
            }
      )
    );
  }

  signTypedData(_params: SignTypedDataParams): Promise<`0x${string}`> {
    return this.signWith1271Wrapper(hashTypedData(_params));
  }

  private async signWith1271Wrapper(msg: Hash): Promise<`0x${string}`> {
    // TODO: should expose these methods as well via the plugingen functions
    const [, name, version, chainId, verifyingContract, salt] =
      await this.rpcProvider.readContract({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        address: await this.getAddress(),
        functionName: "eip712Domain",
      });

    return this.owner.signTypedData({
      domain: {
        chainId: Number(chainId),
        name,
        salt,
        verifyingContract,
        version,
      },
      types: {
        ERC6900Message: [{ name: "message", type: "bytes" }],
      },
      message: {
        ERC6900Message: {
          message: toBytes(msg),
        },
      },
      primaryType: "ERC6900Message",
    });
  }

  protected async getAccountInitCode(): Promise<`0x${string}`> {
    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: MultiOwnerMSCAFactoryAbi,
        functionName: "createAccount",
        // TODO: this needs to support creating accounts with multiple owners
        args: [this.index, [await this.owner.getAddress()]],
      }),
    ]);
  }
}

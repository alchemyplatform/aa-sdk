import {
  toHex,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type Transport,
} from "viem";
import type { ClientMiddlewareConfig } from "../client/types";
import type { EntryPointVersion } from "../entrypoint/types";
import { ChainNotFoundError } from "../errors/client.js";
import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../types";
import {
  deepHexlify,
  resolveProperties,
  type Deferrable,
} from "../utils/index.js";
import type { ClientMiddlewareFn } from "./types";

export type Erc7677RpcSchema<
  TContext extends Record<string, any> = Record<string, any>
> = [
  {
    Method: "pm_getPaymasterStubData";
    Parameters: [UserOperationRequest, Address, Hex, TContext];
    ReturnType: {
      sponsor?: { name: string; icon?: string }; // Sponsor info
      paymaster?: Address; // Paymaster address (entrypoint v0.7)
      paymasterData?: Hex; // Paymaster data (entrypoint v0.7)
      paymasterVerificationGasLimit?: Hex; // Paymaster validation gas (entrypoint v0.7)
      paymasterPostOpGasLimit?: Hex; // Paymaster post-op gas (entrypoint v0.7)
      paymasterAndData?: Hex; // Paymaster and data (entrypoint v0.6)
      isFinal?: boolean; // Indicates that the caller does not need to call pm_getPaymasterData
    };
  },
  {
    Method: "pm_getPaymasterData";
    Parameters: [UserOperationRequest, Address, Hex, TContext];
    ReturnType: {
      paymaster?: Address; // Paymaster address (entrypoint v0.7)
      paymasterData?: Hex; // Paymaster data (entrypoint v0.7)
      paymasterAndData?: Hex; // Paymaster and data (entrypoint v0.6)
    };
  }
];

export type Erc7677Client<
  T extends Transport = Transport,
  TContext extends Record<string, any> = Record<string, any>
> = Client<T, Chain, undefined, Erc7677RpcSchema<TContext>>;

export type Erc7677MiddlewareParams<
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined,
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  context?:
    | ((
        struct: Deferrable<UserOperationStruct<TEntryPointVersion>>,
        args: {
          overrides?: UserOperationOverrides<TEntryPointVersion>;
          feeOptions?: UserOperationFeeOptions;
        }
      ) => Promise<TContext>)
    | TContext;
};

/**
 * Middleware function for interacting with ERC-7677 enabled clients. It supports resolving paymaster and data fields for user operations.
 * This middleware assumes that your RPC provider supports the ERC-7677 methods (pm_getPaymasterStubData and pm_getPaymasterData).
 *
 * @example
 * ```ts
 * import { createSmartAccountClient, erc7677Middleware } from "@aa-sdk/core";
 * import { http } from "viem";
 * import { sepolia } from "viem/chains";
 *
 * const client = createSmartAccountClient({
 *  transport: http("rpc-url"),
 *  chain: sepolia,
 *  // this assumes that your RPC provider supports the ERC-7677 methods AND takes no context
 *  ...erc7677Middleware(),
 * })
 * ```
 *
 * @param {Erc7677MiddlewareParams<TContext>} params Middleware parameters including context function or object. Context can be resolved dynamically by passing in a function which takes in the context at the time of sending a user op
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} An object containing middleware functions `dummyPaymasterAndData` and `paymasterAndData` for processing user operations with the paymaster data
 */
export function erc7677Middleware<
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
>(
  params?: Erc7677MiddlewareParams<TContext>
): Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData"> {
  const dummyPaymasterAndData: ClientMiddlewareFn = async (
    uo,
    { client, account, feeOptions, overrides }
  ) => {
    const userOp = deepHexlify(await resolveProperties(uo));

    // Those values will be set after fee estimation.
    userOp.maxFeePerGas = "0x0";
    userOp.maxPriorityFeePerGas = "0x0";
    userOp.callGasLimit = "0x0";
    userOp.verificationGasLimit = "0x0";
    userOp.preVerificationGas = "0x0";

    const entrypoint = account.getEntryPoint();

    if (entrypoint.version === "0.7.0") {
      userOp.paymasterVerificationGasLimit = "0x0";
      userOp.paymasterPostOpGasLimit = "0x0";
    }

    const context =
      (typeof params?.context === "function"
        ? await params?.context(userOp, { overrides, feeOptions })
        : params?.context) ?? {};

    if (!client.chain) {
      throw new ChainNotFoundError();
    }

    const erc7677client = client as Erc7677Client;
    // TODO: probably need to handle the sponsor and isFinal fields
    const {
      paymaster,
      paymasterAndData,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
    } = await erc7677client.request({
      method: "pm_getPaymasterStubData",
      params: [userOp, entrypoint.address, toHex(client.chain.id), context],
    });

    if (entrypoint.version === "0.6.0") {
      return {
        ...uo,
        paymasterAndData,
      };
    }

    return {
      ...uo,
      paymaster,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
    };
  };

  const paymasterAndData: ClientMiddlewareFn = async (
    uo,
    { client, account, feeOptions, overrides }
  ) => {
    const userOp = deepHexlify(await resolveProperties(uo));
    const context =
      (typeof params?.context === "function"
        ? await params?.context(userOp, { overrides, feeOptions })
        : params?.context) ?? {};

    if (!client.chain) {
      throw new ChainNotFoundError();
    }

    const erc7677client = client as Erc7677Client;

    const entrypoint = account.getEntryPoint();
    const { paymaster, paymasterAndData, paymasterData } =
      await erc7677client.request({
        method: "pm_getPaymasterData",
        params: [userOp, entrypoint.address, toHex(client.chain.id), context],
      });

    if (entrypoint.version === "0.6.0") {
      return {
        ...uo,
        paymasterAndData,
      };
    }

    return {
      ...uo,
      paymaster,
      paymasterData,
    };
  };

  return {
    dummyPaymasterAndData,
    paymasterAndData,
  };
}

import { getConnectorClient, type Config } from "@wagmi/core";
import {
  hexToNumber,
  toHex,
  type Address,
  type Capabilities,
  type Hex,
  type Prettify,
} from "viem";
import { swapActions } from "@alchemy/wallet-apis/experimental";
import {
  assertSmartWalletClient,
  type PrepareCallsResult,
} from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";
import { assertNever } from "@alchemy/common";
import type { UserOperation } from "viem/account-abstraction";

export type PrepareSwapParameters = Prettify<
  {
    chainId?: number;
    fromToken: Address;
    toToken: Address;
    slippageBps?: bigint;
    postCalls?: { to: Address; data?: Hex; value?: bigint }[];
    capabilities?: Capabilities;
  } & ({ fromAmount: bigint } | { minimumToAmount: bigint }) &
    ConnectorParameter
>;

export type PrepareSwapReturnType = Prettify<
  TransformedPreparedCalls & {
    quote: {
      fromAmount: bigint;
      minimumToAmount: bigint;
      expiry: Date;
    };
  }
>;

/**
 * Prepare a token swap by requesting a quote and returning the quote and prepared calls.
 *
 * This function requests a swap quote from the wallet APIs and returns the prepared calls
 * along with quote information. The returned prepared calls can be used with `submitSwap`
 * to execute the actual swap transaction.
 *
 * @param {Config} config - The Wagmi config
 * @param {PrepareSwapParameters} parameters - Parameters for the swap including token addresses, amounts, slippage, and optional post-calls
 * @returns {Promise<PrepareSwapReturnType>} Promise that resolves with prepared calls and quote information
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet or if raw calls are returned
 */
export async function prepareSwap(
  config: Config,
  parameters: PrepareSwapParameters,
): Promise<PrepareSwapReturnType> {
  const { connector, chainId, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'prepareSwap' action must be used with an Alchemy smart wallet",
  );

  const experimentalClient = client.extend(swapActions<Address>);

  const { quote, ...rest } = await experimentalClient.requestQuoteV0({
    ...params,
    slippage:
      params.slippageBps != null ? toHex(params.slippageBps) : undefined,
    ...("fromAmount" in params
      ? {
          fromAmount: toHex(params.fromAmount),
        }
      : {
          minimumToAmount: toHex(params.minimumToAmount),
        }),
    postCalls: params.postCalls?.map((call) => ({
      ...call,
      value: call.value != null ? toHex(call.value) : undefined,
    })),
  });
  if (rest.rawCalls) {
    // This should be impossible since we are not using the `returnRawCalls` option,
    // as we asserted we have an Alchemy smart wallet. The `returnRawCalls` option is
    // for using an EOA wallet, which is currently unsupported since we wouldn't
    // have an auth'd client for making the request to wallet apis.
    throw new Error("Unexpected quote result containing raw calls");
  }
  const { rawCalls: _rawCalls, ...preparedCalls } = rest;

  return {
    quote: {
      fromAmount: BigInt(quote.fromAmount),
      minimumToAmount: BigInt(quote.minimumToAmount),
      expiry: new Date(quote.expiry),
    },
    ...transformPreparedCalls(preparedCalls),
  };
}

// TODO(jh): extract to shared file
const transformUserOperationCall = (
  uoCall: Extract<
    PrepareCallsResult,
    { type: "user-operation-v070" } | { type: "user-operation-v060" }
  >,
): {
  type: "user-operation-v070" | "user-operation-v060";
  chainId: number;
  data: UserOperation;
  signatureRequest: Extract<
    PrepareCallsResult,
    { type: "user-operation-v070" } | { type: "user-operation-v060" }
  >["signatureRequest"];
  feePayment: Omit<
    Extract<
      PrepareCallsResult,
      { type: "user-operation-v070" } | { type: "user-operation-v060" }
    >["feePayment"],
    "maxAmount"
  > & { maxAmount: bigint };
} => {
  return {
    type: uoCall.type,
    chainId: hexToNumber(uoCall.chainId),
    signatureRequest: uoCall.signatureRequest,
    feePayment: {
      ...uoCall.feePayment,
      maxAmount: BigInt(uoCall.feePayment.maxAmount),
    },
    // TODO(jh): transform the UO to match viem's type!
    data: uoCall.data as any,
  };
};

const transformPreparedCalls = (preparedCalls: PrepareCallsResult) => {
  const transformCall = (
    calls: Exclude<PrepareCallsResult, { type: "array" }>,
  ) => {
    switch (calls.type) {
      case "user-operation-v060":
      case "user-operation-v070": {
        return transformUserOperationCall(calls);
      }
      case "paymaster-permit": {
        return {
          ...calls,
          modifiedRequest: {
            ...calls.modifiedRequest,
            // TODO(jh): transform these calls!
            calls: calls.modifiedRequest.calls,
            // TODO(jh): transform the capabilities?
            capabilities: calls.modifiedRequest.capabilities,
            chainId: hexToNumber(calls.modifiedRequest.chainId),
          },
        };
      }
      default: {
        return assertNever(calls, "Unexpected prepared calls type");
      }
    }
  };
  return preparedCalls.type === "array"
    ? { type: "array", data: preparedCalls.data.map(transformCall) } // TODO(jh): what's wrong w/ this type?
    : transformCall(preparedCalls);
};

type TransformedPreparedCalls = ReturnType<typeof transformPreparedCalls>;

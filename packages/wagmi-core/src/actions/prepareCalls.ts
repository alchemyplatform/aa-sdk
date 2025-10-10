import { getConnectorClient, type Config } from "@wagmi/core";
import {
  toHex,
  type Address,
  type Capabilities,
  type Hex,
  type Prettify,
} from "viem";
import { assertSmartWalletClient } from "@alchemy/wallet-apis";
import type { ConnectorParameter } from "@wagmi/core/internal";
import {
  viemEncodePreparedCalls,
  type ViemEncodedPreparedCalls,
} from "../utils/viemEncode.js";
import { viemDecodeCapabilities } from "../utils/viemDecode.js";

export type PrepareCallsParameters = Prettify<
  {
    calls: { to: Address; data?: Hex; value?: bigint }[];
    chainId?: number;
    capabilities?: Capabilities;
  } & ConnectorParameter
>;

export type PrepareCallsReturnType = Prettify<ViemEncodedPreparedCalls>;

/**
 * Prepare calls for execution by encoding them in the required format.
 *
 * This function takes a set of calls and prepares them for execution through the wallet.
 * The returned prepared calls can be used with `sendPreparedCalls` to execute the transactions.
 *
 * @param {Config} config - The Wagmi config
 * @param {PrepareCallsParameters} parameters - Parameters including calls, chainId, and optional capabilities
 * @returns {Promise<PrepareCallsReturnType>} Promise that resolves with prepared calls information
 * @throws {Error} Throws if the wallet is not an Alchemy smart wallet
 */
export async function prepareCalls(
  config: Config,
  parameters: PrepareCallsParameters,
): Promise<PrepareCallsReturnType> {
  const { connector, chainId, ...params } = parameters;

  const client = await getConnectorClient(config, {
    chainId,
    connector,
  });
  assertSmartWalletClient(
    client,
    "'prepareCalls' action must be used with an Alchemy smart wallet",
  );

  const preparedCalls = await client.prepareCalls({
    from: client.account.address,
    chainId: chainId ? toHex(chainId) : undefined,
    calls: params.calls.map((call) => ({
      to: call.to,
      data: call.data,
      value: call.value != null ? toHex(call.value) : undefined,
    })),
    capabilities: viemDecodeCapabilities(params.capabilities),
  });

  return viemEncodePreparedCalls(preparedCalls);
}

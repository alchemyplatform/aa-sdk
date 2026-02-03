import { createClient, type Address, type Chain } from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import type { SmartWalletClient, SmartWalletSigner } from "./types.js";
import { createInternalState } from "./internal.js";
import { isLocalAccount } from "./utils/assertions.js";
import type { AlchemyWalletTransport } from "./transport.js";

export type CreateSmartWalletClientParams = {
  signer: SmartWalletSigner;
  transport: AlchemyWalletTransport;
  chain: Chain;
  account?: Address;
  paymaster?: {
    policyId?: string;
    policyIds?: string[];
  };
};

/**
 * Creates a smart wallet client with wallet API actions.
 *
 * By default, the client uses EIP-7702 with the signer's address, allowing you to call
 * `prepareCalls` or `sendCalls` directly without first calling `requestAccount`.
 * Use `requestAccount` only if you need a non-7702 smart account.
 *
 * @param {CreateSmartWalletClientParams} params - Parameters for creating the smart wallet client.
 * @param {SmartWalletSigner} params.signer - The signer to use for signing transactions.
 * @param {AlchemyWalletTransport} params.transport - The transport to use for RPC calls.
 * @param {Chain} params.chain - The blockchain network to connect to.
 * @param {Address} [params.account] - Optional account address. Defaults to the signer's address (EIP-7702).
 * @param {object} [params.paymaster] - Optional paymaster configuration with policy IDs.
 * @returns {SmartWalletClient} A wallet client extended with smart wallet actions.
 */
export const createSmartWalletClient = ({
  signer,
  transport,
  chain,
  account,
  paymaster,
}: CreateSmartWalletClientParams): SmartWalletClient => {
  const _policyIds = [
    ...(paymaster?.policyId ? [paymaster?.policyId] : []),
    ...(paymaster?.policyIds ?? []),
  ];

  // If no account address is provided, the client defaults to using the signer's address via EIP-7702.
  const _account =
    account ??
    (isLocalAccount(signer) ? signer.address : signer.account.address);

  return createClient({
    account: _account,
    transport,
    chain,
    name: "alchemySmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(smartWalletActions);
};

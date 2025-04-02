import type { Chain, Client, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationStruct } from "../../types.js";
import { buildUserOperation } from "./buildUserOperation.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types";
import { clientHeaderTrack } from "../../index.js";

export type CheckGasSponsorshipEligibilityResult<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  eligible: boolean;
  request?: UserOperationStruct<TEntryPointVersion>;
};

/**
 * This function verifies the eligibility of the connected account for gas sponsorship concerning the upcoming `UserOperation` (UO) that is intended to be sent.
 * Internally, this method invokes `buildUserOperation`, which navigates through the middleware pipeline, including the `PaymasterMiddleware`. Its purpose is to construct the UO struct meant for transmission to the bundler. Following the construction of the UO struct, this function verifies if the resulting structure contains a non-empty `paymasterAndData` field.
 * You can utilize this method before sending the user operation to confirm its eligibility for gas sponsorship. Depending on the outcome, it allows you to tailor the user experience accordingly, based on eligibility.
 *
 * @example
 * ```ts
 * import { smartAccountClient } from "./smartAccountClient";
 * // [!code focus:99]
 * const { eligible } = await smartAccountClient.checkGasSponsorshipEligibility({
 *   uo: {
 *     data: "0xCalldata",
 *     target: "0xTarget",
 *     value: 0n,
 *   },
 * });
 *
 * console.log(
 *   `User Operation is ${
 *     eligible ? "eligible" : "ineligible"
 *   } for gas sponsorship.`
 * );
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client_ the smart account client to use for making RPC calls
 * @param {SendUserOperationParameters} args containing the user operation, account, context, and overrides
 * @returns {Promise<CheckGasSponsorshipEligibilityResult<TAccount>>} a Promise containing a boolean indicating if the account is elgibile for sponsorship and the sponsored UO
 */
export function checkGasSponsorshipEligibility<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  client_: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount, TContext>
): Promise<CheckGasSponsorshipEligibilityResult<TAccount>> {
  const client = clientHeaderTrack(client_, "checkGasSponsorshipEligibility");
  const { account = client.account, overrides, context } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "checkGasSponsorshipEligibility",
      client
    );
  }

  return buildUserOperation(client, {
    uo: args.uo,
    account,
    overrides,
    context,
  })
    .then((userOperationStruct) => ({
      eligible:
        account.getEntryPoint().version === "0.6.0"
          ? (userOperationStruct as UserOperationStruct<"0.6.0">)
              .paymasterAndData !== "0x" &&
            (userOperationStruct as UserOperationStruct<"0.6.0">)
              .paymasterAndData !== null
          : (userOperationStruct as UserOperationStruct<"0.7.0">)
              .paymasterData !== "0x" &&
            (userOperationStruct as UserOperationStruct<"0.7.0">)
              .paymasterData !== null,
      request: userOperationStruct,
    }))
    .catch(() => ({
      eligible: false,
    }));
}

import {
  fromHex,
  concat,
  isAddress,
  decodeErrorResult,
  type Chain,
  type Transport,
} from "viem";
import { AccountNotFoundError } from "../../errors/account.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { UserOperationRequest } from "../../types.js";
import type { EntryPointDef } from "../../index.js";
import { deepHexlify } from "../../utils/index.js";
import {
  packAccountGasLimits,
  packPaymasterData,
} from "../../entrypoint/0.7.js";

/**
 * Retrieves the error message from an entrypoint for a User Operation.
 *
 * @param {Client<TTransport, TChain, TAccount>} client the smart account client to use for RPC requests
 * @param {UserOperationRequest} request the uo request to get the error for
 * @param {EntryPointDef} entryPoint the entrypoint instance to send the uo to
 * @returns {string} the error message from the entrypoint
 */
export async function getUserOperationError<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  request: UserOperationRequest,
  entryPoint: EntryPointDef,
) {
  if (!client.account) {
    throw new AccountNotFoundError();
  }

  const uo = deepHexlify(request);

  try {
    switch (entryPoint.version) {
      case "0.6.0":
        // TODO
        break;
      case "0.7.0":
        await client.simulateContract({
          address: entryPoint.address,
          abi: entryPoint.abi,
          functionName: "handleOps",
          args: [
            [
              {
                sender: client.account.address,
                nonce: fromHex(uo.nonce, "bigint"),
                initCode:
                  uo.factory && uo.factoryData
                    ? concat([uo.factory, uo.factoryData])
                    : "0x",
                callData: uo.callData,
                accountGasLimits: packAccountGasLimits({
                  verificationGasLimit: uo.verificationGasLimit,
                  callGasLimit: uo.callGasLimit,
                }),
                preVerificationGas: fromHex(uo.preVerificationGas, "bigint"),
                gasFees: packAccountGasLimits({
                  maxPriorityFeePerGas: uo.maxPriorityFeePerGas,
                  maxFeePerGas: uo.maxFeePerGas,
                }),
                paymasterAndData:
                  uo.paymaster && isAddress(uo.paymaster)
                    ? packPaymasterData({
                        paymaster: uo.paymaster,
                        paymasterVerificationGasLimit:
                          uo.paymasterVerificationGasLimit,
                        paymasterPostOpGasLimit: uo.paymasterPostOpGasLimit,
                        paymasterData: uo.paymasterData,
                      })
                    : "0x",
                signature: uo.signature,
              },
            ],
            client.account.address,
          ],
        });
    }
  } catch (err: any) {
    if (err?.cause && err?.cause?.raw) {
      try {
        const { errorName, args } = decodeErrorResult({
          abi: entryPoint.abi,
          data: err.cause.raw,
        });
        console.error(`Failed with '${errorName}':`);
        switch (errorName) {
          case "FailedOpWithRevert":
          case "FailedOp":
            // TODO: if we pass in abi we could decode and print this too
            const argsIdx = errorName === "FailedOp" ? 1 : 2;
            console.error(
              args && args[argsIdx]
                ? `Smart contract account reverted with error: ${args[argsIdx]}`
                : "No revert data from smart contract account",
            );
            break;
          default:
            args && args.forEach((arg) => console.error(`\n${arg}`));
        }
        return;
      } catch (err) {}
    }
    console.error("Entrypoint reverted with error: ");
    console.error(err);
  }
}

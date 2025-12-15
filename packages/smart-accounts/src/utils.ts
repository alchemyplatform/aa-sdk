import {
  type Address,
  type Client,
  concat,
  type Hex,
  RawContractError,
  BaseError as ViemBaseError,
  toHex,
} from "viem";
import { call } from "viem/actions";
import {
  concatHex,
  decodeErrorResult,
  encodeFunctionData,
  getAction,
  getAddress,
  isHex,
} from "viem/utils";
import {
  entryPoint07Abi,
  entryPoint08Abi,
  type EntryPointVersion,
  type UserOperation,
} from "viem/account-abstraction";
import { assertNever, BaseError } from "@alchemy/common";

const RIP_7212_CHECK_BYTECODE =
  "0x60806040526040517f532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25815260056020820152600160408201527f4a03ef9f92eb268cafa601072489a56380fa0dc43171d7712813b3a19a1eb5e560608201527f3e213e28a608ce9a2f4a17fd830c6654018a79b3e0263d91a8ba90622df6f2f0608082015260208160a0836101005afa503d5f823e3d81f3fe";

/**
 * Checks if the current chain supports RIP-7212 (precompiled contract for secp256r1 curve operations).
 * This is used to determine if the chain has native support for P256 signature verification,
 * which is commonly used in WebAuthn/passkey implementations.
 *
 * @param {Client} client - The viem client to use for the check
 * @returns {Promise<boolean>} True if the chain supports RIP-7212, false otherwise
 */
export const chainHas7212 = async (client: Client): Promise<boolean> => {
  const callAction = getAction(client, call, "call");

  const { data } = await callAction({
    data: RIP_7212_CHECK_BYTECODE,
  });

  return data ? BigInt(data) === 1n : false;
};

export function packAccountGasLimits(
  data:
    | Pick<UserOperation, "verificationGasLimit" | "callGasLimit">
    | Pick<UserOperation, "maxPriorityFeePerGas" | "maxFeePerGas">,
): Hex {
  return concat(Object.values(data).map((v) => toHex(v, { size: 16 })));
}

export function packPaymasterData({
  paymaster,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  paymasterData,
}: Pick<
  UserOperation,
  | "paymaster"
  | "paymasterVerificationGasLimit"
  | "paymasterPostOpGasLimit"
  | "paymasterData"
>): Hex {
  if (
    !paymaster ||
    !paymasterVerificationGasLimit ||
    !paymasterPostOpGasLimit ||
    !paymasterData
  ) {
    return "0x";
  }
  return concat([
    paymaster,
    toHex(paymasterVerificationGasLimit, { size: 16 }),
    toHex(paymasterPostOpGasLimit, { size: 16 }),
    paymasterData,
  ]);
}

export const bigIntMultiply = (
  base: number | bigint | Hex,
  multiplier: number,
  roundingMode: "ROUND" | "FLOOR" | "CEIL" = "CEIL",
) => {
  if (Number.isInteger(multiplier)) {
    return BigInt(base) * BigInt(multiplier);
  }

  const multiplierStr = multiplier.toString();
  const decimalPlaces = multiplierStr.split(".")[1]?.length ?? 0;

  if (decimalPlaces > 4) {
    throw new BaseError("bigIntMultiply max precision is 4 decimal places.");
  }

  const scale = BigInt(10 ** decimalPlaces);
  const scaledMultiplier = BigInt(multiplierStr.replace(".", ""));
  const product = BigInt(base) * scaledMultiplier;

  switch (roundingMode) {
    case "ROUND":
      return (product + scale / 2n) / scale;
    case "CEIL":
      return product >= 0n ? (product + scale - 1n) / scale : product / scale;
    case "FLOOR":
    default:
      return product >= 0n ? product / scale : (product - scale + 1n) / scale;
  }
};

/**
 * Derives the counterfactual smart account address from init code by calling
 * the entry point's `getSenderAddress` function.
 *
 * @param {Client} client - The viem client to use for the call.
 * @param {object} params - The parameters for deriving the sender address.
 * @param {Hex} params.factory - The factory address for the account.
 * @param {Hex} params.factoryData - The factory data for the account.
 * @param {object} params.entryPoint - The entry point contract details.
 * @param {EntryPointVersion} [params.entryPoint.version] - The entry point version ("0.6" or "0.7").
 * @param {Address} params.entryPoint.address - The entry point contract address.
 * @returns {Promise<Address>} The counterfactual address of the smart account.
 */
export const getSenderFromFactoryData = async (
  client: Client,
  params: {
    factory: Hex;
    factoryData: Hex;
    entryPoint: {
      version: EntryPointVersion;
      address: Address;
    };
  },
): Promise<Address> => {
  const action = getAction(client, call, "call");

  const data = encodeFunctionData({
    abi: entryPoint07Abi, // getSenderAddress is the same for EP v0.6, EP v0.7, and v0.8
    functionName: "getSenderAddress",
    args: [concatHex([params.factory, params.factoryData])],
  });

  try {
    // getSenderAddress is expected to revert with the computed sender
    await action({ to: params.entryPoint.address, data });
  } catch (err) {
    const revertData = getRevertErrorData(err);
    if (!isHex(revertData)) {
      throw new BaseError(
        "Failed to get sender address from init code: no revert data found.",
      );
    }

    switch (params.entryPoint.version) {
      case "0.8":
      case "0.7": {
        const decoded = decodeErrorResult({
          abi:
            params.entryPoint.version === "0.8"
              ? entryPoint08Abi
              : entryPoint07Abi,
          data: revertData,
        });
        if (decoded.errorName !== "SenderAddressResult") {
          throw new BaseError(
            `Unexpected error from getSenderAddress: ${decoded.errorName}`,
          );
        }
        return decoded.args[0];
      }
      case "0.6":
        // EP v0.6: last 20 bytes is the address.
        return getAddress(`0x${revertData.slice(-40)}`);
      default:
        return assertNever(
          params.entryPoint.version,
          "Unexpected entry point version",
        );
    }
  }
  throw new BaseError("Expected getSenderAddress to revert.");
};

// Borrowed from Viem: https://github.com/wevm/viem/blob/3ff6c2f19350dcbe49017e2b3d5a2cf761ab9070/src/actions/public/call.ts#L473
function getRevertErrorData(err: unknown) {
  if (!(err instanceof ViemBaseError)) return undefined;
  const error = err.walk() as RawContractError;
  return typeof error?.data === "object" ? error.data?.data : error.data;
}

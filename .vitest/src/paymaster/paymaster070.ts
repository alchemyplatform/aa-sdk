import {
  deepHexlify,
  resolveProperties,
  type UserOperationRequest_v7,
} from "@aa-sdk/core";
import { concat, encodeAbiParameters, keccak256, pad, toHex } from "viem";
import { accounts, entrypoint070 } from "../constants";
import { toPaymaster } from "./base";
import type { Paymaster } from "./types";
import { VerifyingPaymaster070Abi } from "./VerifyingPaymaster070";

export const paymaster070: Paymaster = toPaymaster({
  entryPointVersion: "0.7.0",
  entryPointAddress: entrypoint070,
  abi: VerifyingPaymaster070Abi,
  dummyData: concat([
    "0xffffffffffffffffffffffff",
    "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  ]),
  getPaymasterStubData(self) {
    const { address, dummyData } = self.getPaymasterDetails();

    return { paymaster: address, paymasterData: dummyData };
  },
  async getPaymasterData(self, uo_, client) {
    const { address } = self.getPaymasterDetails();
    const uo = deepHexlify(
      // @ts-ignore
      await resolveProperties(uo_)
    ) as UserOperationRequest_v7;

    const validUntil = 0n;
    const validFrom = 0n;
    const expiryPacked =
      (validUntil << BigInt(160)) | (validFrom << BigInt(160 + 48));

    const encoding = keccak256(
      encodeAbiParameters(
        [
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "address" },
          { type: "uint" },
          { type: "uint256" },
        ],
        [
          uo.sender,
          BigInt(uo.nonce),
          keccak256(uo.factory ? concat([uo.factory, uo.factoryData!]) : "0x"),
          keccak256(uo.callData),
          concat([
            pad(uo.verificationGasLimit, { dir: "left", size: 16 }),
            pad(uo.callGasLimit, { dir: "left", size: 16 }),
          ]),
          BigInt(uo.preVerificationGas),
          concat([
            pad(uo.maxPriorityFeePerGas, { dir: "left", size: 16 }),
            pad(uo.maxFeePerGas, { dir: "left", size: 16 }),
          ]),
          concat([
            pad(uo.paymasterVerificationGasLimit ?? "0x0", {
              dir: "left",
              size: 16,
            }),
            pad(uo.paymasterPostOpGasLimit ?? "0x0", { dir: "left", size: 16 }),
          ]),
          entrypoint070,
          BigInt(client.chain!.id),
          expiryPacked,
        ]
      )
    );

    const signature = await accounts.paymasterOwner.signMessage({
      message: { raw: encoding },
    });

    const paymasterData = concat([
      toHex(validFrom, { size: 6 }),
      toHex(validUntil, { size: 6 }),
      signature,
    ]);

    return { paymaster: address, paymasterData };
  },
});

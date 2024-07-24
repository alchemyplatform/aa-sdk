import { concat, getContract, toHex } from "viem";
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
  async getPaymasterData(self, uo, client) {
    const { address } = self.getPaymasterDetails();

    const contract = getContract({
      abi: VerifyingPaymaster070Abi.abi,
      client: client,
      address,
    });

    const validUntil = 0n;
    const validFrom = 0n;
    const expiryPacked =
      (validUntil << BigInt(160)) | (validFrom << BigInt(160 + 48));

    // @ts-ignore
    const encoding = await contract.read.getHash([uo, expiryPacked]);
    const signature = await accounts.paymasterOwner.signMessage({
      message: { raw: encoding },
    });

    const paymasterData = concat([
      address,
      toHex(validFrom, { size: 12 }),
      toHex(validUntil, { size: 12 }),
      signature,
    ]);

    return { paymaster: address, paymasterData };
  },
});

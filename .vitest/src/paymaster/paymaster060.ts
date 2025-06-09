import { concat, encodePacked, getContract, type Hex } from "viem";
import { accounts, entrypoint060 } from "../constants";
import { toPaymaster } from "./base";
import type { Paymaster } from "./types";
import { VerifyingPaymaster060Abi } from "./VerifyingPaymaster060";

export const paymaster060: Paymaster = toPaymaster({
  entryPointVersion: "0.6.0",
  entryPointAddress: entrypoint060,
  abi: VerifyingPaymaster060Abi,
  dummyData: concat([
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  ]),
  getPaymasterStubData(self) {
    const { address, dummyData } = self.getPaymasterDetails();

    return { paymasterAndData: concat([address, dummyData]) };
  },
  async getPaymasterData(self, uo, client) {
    const { address } = self.getPaymasterDetails();

    const contract = getContract({
      abi: VerifyingPaymaster060Abi.abi,
      client: client,
      address,
    });

    const validUntil = 0n;
    const validFrom = 0n;
    const expiry =
      (validUntil << BigInt(160)) | (validFrom << BigInt(160 + 48));

    // @ts-ignore
    const encoding = await contract.read.getHash([uo, expiry]);
    const signature = await accounts.paymasterOwner.signMessage({
      message: { raw: encoding },
    });

    const paymasterAndData = encodePacked(
      ["address", "uint256", "bytes"],
      [address, expiry, signature],
    ) as Hex;

    return { paymasterAndData };
  },
});

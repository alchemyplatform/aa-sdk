import type { UserOperationRequest } from "../types";
import { getUserOperationHash } from "../utils/index.js";

describe("Utils Tests", () => {
  const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

  it("getUserOperationHash should correctly hash a request", () => {
    expect(
      getUserOperationHash(
        {
          callData:
            "0xb61d27f6000000000000000000000000b856dbd4fa1a79a46d426f537455e7d3e79ab7c4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          callGasLimit: "0x2f6c",
          initCode: "0x",
          maxFeePerGas: "0x59682f1e",
          maxPriorityFeePerGas: "0x59682f00",
          nonce: "0x1f",
          paymasterAndData: "0x",
          preVerificationGas: "0xa890",
          sender: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
          signature:
            "0xd16f93b584fbfdc03a5ee85914a1f29aa35c44fea5144c387ee1040a3c1678252bf323b7e9c3e9b4dfd91cca841fc522f4d3160a1e803f2bf14eb5fa037aae4a1b",
          verificationGasLimit: "0x114c2",
        } as UserOperationRequest,
        ENTRYPOINT_ADDRESS as `0x${string}`,
        80001n
      )
    ).toMatchInlineSnapshot(
      `"0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"`
    );
  });
});

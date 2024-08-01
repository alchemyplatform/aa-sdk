import { sepolia } from "viem/chains";
import { getEntryPoint } from "../entrypoint/index.js";
import { stringToIndex } from "../utils/index.js";

describe("Utils Tests", () => {
  const chain = sepolia;
  const entryPoint = getEntryPoint(chain);

  it("getUserOperationHash should correctly hash a request", () => {
    expect(
      entryPoint.getUserOperationHash({
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
      })
    ).toMatchInlineSnapshot(
      '"0xbb5560c1a3983429a6cdb244fa532fb4f2cf0de8ba9ccbf257bff93d069c76a3"'
    );
  });

  describe("bigint utils", () => {
    it("produces an index value from a string", () => {
      const index = stringToIndex("alice@example.com");

      expect(index).toEqual(
        53219281434065493725260108619161294016101536485294536107629387514619165176826n
      );
    });
  });
});

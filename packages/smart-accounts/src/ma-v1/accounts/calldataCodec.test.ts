import { type Address, type Call } from "viem";
import { encodeCallsMAv1, decodeCallsMAv1 } from "./calldataCodec.js";

const accountAddress: Address = "0x1111111111111111111111111111111111111111";
const targetAddress: Address = "0x2222222222222222222222222222222222222222";
const targetAddress2: Address = "0x3333333333333333333333333333333333333333";

describe("ModularAccountV1 calldataCodec", () => {
  it("should roundtrip a single call", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        value: 1n,
        data: "0xabcd",
      },
    ];

    const encoded = encodeCallsMAv1(calls);
    const decoded = decodeCallsMAv1(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should roundtrip a single call with default value/data", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
      },
    ];

    const encoded = encodeCallsMAv1(calls);
    const decoded = decodeCallsMAv1(encoded, accountAddress);

    // Encode defaults value to 0n and data to "0x".
    expect(decoded).toEqual([
      {
        to: targetAddress,
        value: 0n,
        data: "0x",
      },
    ]);
  });

  it("should roundtrip multiple calls", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        value: 1n,
        data: "0xabcd",
      },
      {
        to: targetAddress2,
        value: 2n,
        data: "0x1234",
      },
    ];

    const encoded = encodeCallsMAv1(calls);
    const decoded = decodeCallsMAv1(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });
});

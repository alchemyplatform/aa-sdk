import { type Address, type Call, encodeFunctionData } from "viem";
import { encodeCallsLA, decodeCallsLA } from "./calldataCodec.js";
import { LightAccountAbi_v1 } from "../abis/LightAccountAbi_v1.js";

const accountAddress: Address = "0x1111111111111111111111111111111111111111";
const targetAddress: Address = "0x2222222222222222222222222222222222222222";
const targetAddress2: Address = "0x3333333333333333333333333333333333333333";

describe("LightAccount calldataCodec", () => {
  it("should roundtrip a single call", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        value: 1n,
        data: "0xabcd",
      },
    ];

    const encoded = encodeCallsLA(calls);
    const decoded = decodeCallsLA(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should roundtrip a single call without value", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        data: "0xabcd",
      },
    ];

    const encoded = encodeCallsLA(calls);
    const decoded = decodeCallsLA(encoded, accountAddress);

    // Encode defaults value to 0n, decode conditionally includes it.
    expect(decoded).toEqual([
      {
        to: targetAddress,
        data: "0xabcd",
        value: 0n,
      },
    ]);
  });

  it("should roundtrip multiple calls with values", () => {
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

    const encoded = encodeCallsLA(calls);
    const decoded = decodeCallsLA(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should roundtrip multiple calls without values", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        data: "0xabcd",
      },
      {
        to: targetAddress2,
        data: "0x1234",
      },
    ];

    const encoded = encodeCallsLA(calls);
    const decoded = decodeCallsLA(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should decode non-execute ABI function as self-call", () => {
    const data = encodeFunctionData({
      abi: LightAccountAbi_v1,
      functionName: "domainSeparator",
    });
    const decoded = decodeCallsLA(data, accountAddress);

    expect(decoded).toEqual([
      {
        to: accountAddress,
        data,
      },
    ]);
  });
});

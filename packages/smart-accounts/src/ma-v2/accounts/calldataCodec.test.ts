import { type Address, type Call, concatHex } from "viem";
import { encodeCallsMAv2, decodeCallsMAv2 } from "./calldataCodec.js";
import { EXECUTE_USER_OP_SELECTOR } from "../utils/account.js";

const accountAddress: Address = "0x1111111111111111111111111111111111111111";
const targetAddress: Address = "0x2222222222222222222222222222222222222222";
const targetAddress2: Address = "0x3333333333333333333333333333333333333333";

describe("ModularAccountV2 calldataCodec", () => {
  it("should throw on empty calls", () => {
    expect(() => encodeCallsMAv2([])).toThrow("No calls to encode.");
  });

  it("should roundtrip a single call", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        value: 1n,
        data: "0xabcd",
      },
    ];

    const encoded = encodeCallsMAv2(calls);
    const decoded = decodeCallsMAv2(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should roundtrip a single call with default value/data", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
      },
    ];

    const encoded = encodeCallsMAv2(calls);
    const decoded = decodeCallsMAv2(encoded, accountAddress);

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

    const encoded = encodeCallsMAv2(calls);
    const decoded = decodeCallsMAv2(encoded, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should decode with EXECUTE_USER_OP_SELECTOR prefix", () => {
    const calls: Call[] = [
      {
        to: targetAddress,
        value: 1n,
        data: "0xabcd",
      },
    ];

    const encoded = encodeCallsMAv2(calls);
    const withPrefix = concatHex([EXECUTE_USER_OP_SELECTOR, encoded]);
    const decoded = decodeCallsMAv2(withPrefix, accountAddress);

    expect(decoded).toEqual(calls);
  });

  it("should decode unrecognized selector as self-call", () => {
    const data = "0x12345678";
    const decoded = decodeCallsMAv2(data, accountAddress);

    expect(decoded).toEqual([
      {
        to: accountAddress,
        data,
      },
    ]);
  });
});

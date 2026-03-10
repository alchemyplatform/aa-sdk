import { encodeFunctionData, erc20Abi } from "viem";
import { encodeCalls } from "./encodeCalls.js";

describe("encodeCalls", () => {
  it("passes through an encoded call unchanged", () => {
    const result = encodeCalls([
      { to: "0x1234567890abcdef1234567890abcdef12345678", data: "0xdeadbeef" },
    ]);

    expect(result).toEqual([
      { to: "0x1234567890abcdef1234567890abcdef12345678", data: "0xdeadbeef" },
    ]);
  });

  it("encodes an abi-style call", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;
    const args = ["0x000000000000000000000000000000000000dead", 1000n] as const;

    const result = encodeCalls([
      { to, abi: erc20Abi, functionName: "transfer", args },
    ]);

    const expectedData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args,
    });

    expect(result).toEqual([{ to, data: expectedData }]);
  });

  it("handles a mixed array of encoded and abi-style calls", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;

    const result = encodeCalls([
      { to, data: "0xdeadbeef" },
      {
        to,
        abi: erc20Abi,
        functionName: "transfer",
        args: ["0x000000000000000000000000000000000000dead", 500n],
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ to, data: "0xdeadbeef" });
    expect(result[1]!.data).toBeDefined();
    expect(result[1]!.to).toBe(to);
  });

  it("rejects dataSuffix on an encoded call", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;

    expect(() =>
      encodeCalls([{ to, data: "0xdeadbeef", dataSuffix: "0xc0ffee" }]),
    ).toThrow(
      "`dataSuffix` on individual calls is not supported. Use `capabilities.experimental_dataSuffix` instead.",
    );
  });

  it("rejects dataSuffix on an abi-style call", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;
    const args = ["0x000000000000000000000000000000000000dead", 1000n] as const;

    expect(() =>
      encodeCalls([
        {
          to,
          abi: erc20Abi,
          functionName: "transfer",
          args,
          dataSuffix: "0xc0ffee",
        },
      ]),
    ).toThrow(
      "`dataSuffix` on individual calls is not supported. Use `capabilities.experimental_dataSuffix` instead.",
    );
  });

  it("preserves value on both call types", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;

    const result = encodeCalls([
      { to, data: "0xdeadbeef", value: 100n },
      {
        to,
        abi: erc20Abi,
        functionName: "transfer",
        args: ["0x000000000000000000000000000000000000dead", 500n],
        value: 200n,
      },
    ]);

    expect(result[0]!.value).toBe(100n);
    expect(result[1]!.value).toBe(200n);
  });

  it("handles a call with only to (no data or abi)", () => {
    const to = "0x1234567890abcdef1234567890abcdef12345678" as const;

    const result = encodeCalls([{ to, value: 1000n }]);

    expect(result).toEqual([{ to, value: 1000n }]);
  });
});

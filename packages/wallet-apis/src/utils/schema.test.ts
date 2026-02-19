import { Type } from "typebox";
import { encode, decode, methodSchema } from "./schema.js";
import {
  wallet_prepareCalls,
  wallet_listAccounts,
} from "@alchemy/wallet-api-types/rpc";

const prepareCallsSchema = methodSchema(wallet_prepareCalls);
const listAccountsSchema = methodSchema(wallet_listAccounts);

/** Valid base params for wallet_prepareCalls. */
const validPrepareCallsParams = {
  from: "0xd46e8dd67c5d32be8058bb8eb970870f07244567" as const,
  calls: [{ to: "0xd46e8dd67c5d32be8058bb8eb970870f07244567" as const }],
  chainId: 1,
};

describe("encode", () => {
  it("encodes valid params", () => {
    const result = encode(prepareCallsSchema.request, validPrepareCallsParams);
    expect(result.chainId).toBe("0x1");
    expect(result.from).toBe("0xd46e8dd67c5d32be8058bb8eb970870f07244567");
  });

  it("prefers the schema's errorMessage over the generic locale message", () => {
    // Address() schema has: errorMessage: "Must be a valid Ethereum address starting with '0x' ..."
    // Without our wrapper, you'd just see: Error("Encode")
    expect(() =>
      encode(prepareCallsSchema.request, {
        ...validPrepareCallsParams,
        from: 12345 as any,
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.stringContaining("Must be a valid Ethereum address"),
      }),
    );
  });

  it("includes the path and received type", () => {
    expect(() =>
      encode(prepareCallsSchema.request, {
        ...validPrepareCallsParams,
        from: 12345 as any,
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.stringMatching(/\/from.*received string/),
      }),
    );
  });

  // ─── Runtime-only validations that TypeScript cannot catch ───
  // These all compile fine because TS sees `string` or `number`,
  // but the schema enforces stricter constraints at runtime.

  it("rejects a policyId that is not a UUID", () => {
    // TS type is `string` — but the schema requires UUID v4 format.
    expect(() =>
      encode(prepareCallsSchema.request, {
        ...validPrepareCallsParams,
        capabilities: {
          paymasterService: { policyId: "not-a-uuid" },
        },
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.stringContaining(
          "/capabilities/paymasterService/policyId",
        ),
      }),
    );
  });

  it("rejects a listAccounts limit outside the 1-100 range", () => {
    // TS type is `number` — but the schema requires minimum: 1, maximum: 100.
    expect(() =>
      encode(listAccountsSchema.request, {
        signerAddress: "0xd46e8dd67c5d32be8058bb8eb970870f07244567" as const,
        limit: 999,
      }),
    ).toThrow(
      expect.objectContaining({
        message: expect.stringContaining("/limit"),
      }),
    );
  });
});

describe("decode", () => {
  it("decodes valid data", () => {
    const schema = Type.Object({ value: Type.String() });
    expect(decode(schema, { value: "hello" })).toEqual({ value: "hello" });
  });

  it("throws a readable error on invalid data", () => {
    const schema = Type.Object({
      // eslint-disable-next-line no-template-curly-in-string
      id: Type.TemplateLiteral("0x${string}", {
        errorMessage: "Must be a hex string",
      }),
    });

    expect(() => decode(schema, { id: 12345 } as any)).toThrow(
      expect.objectContaining({
        message: expect.stringContaining("Must be a hex string"),
      }),
    );
  });
});

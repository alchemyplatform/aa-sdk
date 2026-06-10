import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { emitRpcSchema } from "../src/rpc/rpcEmitter.js";
import { closeObjectSchemas } from "../src/rpc/openrpcWalker.js";

const spec = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/rpc.fixture.json"), "utf8"),
);

describe("closeObjectSchemas", () => {
  it("sets additionalProperties: false on object schemas that omit it", () => {
    const closed = closeObjectSchemas({
      type: "object",
      properties: { nested: { type: "object", properties: {} } },
    }) as Record<string, any>;
    expect(closed.additionalProperties).toBe(false);
    expect(closed.properties.nested.additionalProperties).toBe(false);
  });

  it("does not override an explicit additionalProperties", () => {
    const closed = closeObjectSchemas({
      type: "object",
      additionalProperties: true,
    }) as Record<string, any>;
    expect(closed.additionalProperties).toBe(true);
  });
});

describe("emitRpcSchema", () => {
  it("compiles params/result types and emits the RpcSchema tuple", async () => {
    const source = await emitRpcSchema(
      {
        spec: "rpc.fixture",
        schemaTypeName: "FixtureRpcSchema",
        methods: [
          { method: "fixture_getThings", exportBaseName: "FixtureGetThings" },
        ],
      },
      spec,
    );
    // single param → plain Params name; required → no optional marker
    expect(source).toContain("export interface FixtureGetThingsParams");
    // raw j2ts output (prettier formatting happens at emit time)
    expect(source).toContain(`kind?: ("a" | "b")`);
    // oneOf(string-titled, object) result compiles to a union
    expect(source).toContain("export type FixtureGetThingsResult");
    // no index signatures leak from open object schemas
    expect(source).not.toContain("[k: string]");
    expect(source).toContain(`Method: "fixture_getThings";`);
    expect(source).toContain(
      "Parameters: [thingParams: FixtureGetThingsParams];",
    );
    expect(source).toContain("ReturnType: FixtureGetThingsResult;");
  });

  it("validates dotted pagination paths against params and oneOf results", async () => {
    const withPagination = (pageParam: string, itemsField: string) =>
      emitRpcSchema(
        {
          spec: "rpc.fixture",
          schemaTypeName: "FixtureRpcSchema",
          methods: [
            {
              method: "fixture_getThings",
              exportBaseName: "FixtureGetThings",
              pagination: {
                pageParam,
                responseCursorField: "pageKey",
                itemsField,
              },
            },
          ],
        },
        spec,
      );
    // pageKey/things live in the object branch of the oneOf result; the
    // cursor param is nested under the single object param.
    await expect(
      withPagination("thingParams.limit", "things"),
    ).resolves.toContain("FixtureRpcSchema");
    await expect(withPagination("thingParams.bogus", "things")).rejects.toThrow(
      /thingParams.bogus/,
    );
    await expect(
      withPagination("thingParams.limit", "bogusItems"),
    ).rejects.toThrow(/bogusItems/);
  });
});

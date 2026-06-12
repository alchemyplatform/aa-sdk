import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateRestManifest, validateRpcManifest } from "../src/manifest.js";

const restSpec = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/rest.fixture.json"), "utf8"),
);
const rpcSpec = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/rpc.fixture.json"), "utf8"),
);

describe("validateRestManifest", () => {
  it("passes when all operationIds exist and reports uncovered operations", () => {
    const uncovered = validateRestManifest(
      {
        spec: "rest.fixture",
        schemaTypeName: "FooRestSchema",
        operations: [
          { operationId: "create-foo", exportBaseName: "CreateFoo" },
        ],
      },
      restSpec,
    );
    expect(uncovered).toEqual(["getBar-v3"]);
  });

  it("hard-errors on a missing operationId, naming it", () => {
    expect(() =>
      validateRestManifest(
        {
          spec: "rest.fixture",
          schemaTypeName: "FooRestSchema",
          operations: [
            { operationId: "create-foo-RENAMED", exportBaseName: "CreateFoo" },
          ],
        },
        restSpec,
      ),
    ).toThrow(/create-foo-RENAMED/);
  });
});

describe("validateRpcManifest", () => {
  it("passes when all methods exist", () => {
    const uncovered = validateRpcManifest(
      {
        spec: "rpc.fixture",
        schemaTypeName: "FixtureRpcSchema",
        methods: [{ method: "fixture_getThings", exportBaseName: "GetThings" }],
      },
      rpcSpec,
    );
    expect(uncovered).toEqual([]);
  });

  it("hard-errors on a missing method, naming it", () => {
    expect(() =>
      validateRpcManifest(
        {
          spec: "rpc.fixture",
          schemaTypeName: "FixtureRpcSchema",
          methods: [
            { method: "fixture_getThingsGone", exportBaseName: "GetThings" },
          ],
        },
        rpcSpec,
      ),
    ).toThrow(/fixture_getThingsGone/);
  });
});

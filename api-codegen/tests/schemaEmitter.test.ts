import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { emitRestSchema } from "../src/rest/schemaEmitter.js";

const spec = JSON.parse(
  readFileSync(resolve(__dirname, "fixtures/rest.fixture.json"), "utf8"),
);

describe("emitRestSchema", () => {
  it("emits Body/Response aliases and a schema tuple for a POST operation", () => {
    const source = emitRestSchema(
      {
        spec: "rest.fixture",
        schemaTypeName: "FooRestSchema",
        pathRules: { stripApiKeySegment: true },
        operations: [
          { operationId: "create-foo", exportBaseName: "CreateFoo" },
        ],
      },
      spec,
    );
    expect(source).toContain(
      `import type { operations } from "./rest.fixture.types.js";`,
    );
    expect(source).toContain(
      `export type CreateFooBody = NonNullable<\n  operations["create-foo"]["requestBody"]\n>["content"]["application/json"];`,
    );
    expect(source).toContain(`Route: "foo/create";`);
    expect(source).toContain(`Method: "POST";`);
    expect(source).toContain(`Body: CreateFooBody;`);
    expect(source).toContain(
      `FooRestSchema extends RestRequestSchema ? true : never;`,
    );
  });

  it("emits a query type and bodyless tuple entry for a GET operation", () => {
    const source = emitRestSchema(
      {
        spec: "rest.fixture",
        schemaTypeName: "BarRestSchema",
        pathRules: { stripApiKeySegment: true, stripPrefix: "/v3" },
        operations: [
          {
            operationId: "getBar-v3",
            exportBaseName: "GetBar",
            emitQueryType: true,
          },
        ],
      },
      spec,
    );
    expect(source).toContain(
      `export type GetBarQuery = NonNullable<\n  operations["getBar-v3"]["parameters"]["query"]\n>;`,
    );
    expect(source).toContain(`Route: "getBar";`);
    expect(source).toContain(`Body?: undefined;`);
    // owner is a required query param → Query is required in the tuple
    expect(source).toContain(`Query: GetBarQuery;`);
  });

  it("emits Query?: undefined for operations without query params", () => {
    const source = emitRestSchema(
      {
        spec: "rest.fixture",
        schemaTypeName: "FooRestSchema",
        pathRules: { stripApiKeySegment: true },
        operations: [
          { operationId: "create-foo", exportBaseName: "CreateFoo" },
        ],
      },
      spec,
    );
    expect(source).toContain(`Query?: undefined;`);
    expect(source).not.toContain(`CreateFooQuery`);
  });

  it("validates pagination metadata and hard-errors on unknown fields", () => {
    const config = (pagination: {
      pageParam: string;
      responseCursorField: string;
      itemsField: string;
    }) => ({
      spec: "rest.fixture",
      schemaTypeName: "BarRestSchema",
      pathRules: { stripApiKeySegment: true, stripPrefix: "/v3" },
      operations: [
        { operationId: "getBar-v3", exportBaseName: "GetBar", pagination },
      ],
    });
    // valid: owner is a query param; items is a response property
    expect(() =>
      emitRestSchema(
        config({
          pageParam: "owner",
          responseCursorField: "items",
          itemsField: "items",
        }),
        spec,
      ),
    ).not.toThrow();
    // invalid pageParam
    expect(() =>
      emitRestSchema(
        config({
          pageParam: "bogusCursor",
          responseCursorField: "items",
          itemsField: "items",
        }),
        spec,
      ),
    ).toThrow(/bogusCursor/);
    // invalid response field
    expect(() =>
      emitRestSchema(
        config({
          pageParam: "owner",
          responseCursorField: "bogusField",
          itemsField: "items",
        }),
        spec,
      ),
    ).toThrow(/bogusField/);
  });

  it("hard-errors when the manifest references a deprecated operation", () => {
    const deprecatedSpec = JSON.parse(JSON.stringify(spec));
    deprecatedSpec.paths["/v3/{apiKey}/getBar"].get.deprecated = true;
    expect(() =>
      emitRestSchema(
        {
          spec: "rest.fixture",
          schemaTypeName: "BarRestSchema",
          pathRules: { stripApiKeySegment: true, stripPrefix: "/v3" },
          operations: [{ operationId: "getBar-v3", exportBaseName: "GetBar" }],
        },
        deprecatedSpec,
      ),
    ).toThrow(/deprecated/);
  });
});

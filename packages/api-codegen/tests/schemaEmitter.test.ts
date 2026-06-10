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
  });
});

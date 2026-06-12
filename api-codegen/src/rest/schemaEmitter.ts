import { CodegenError } from "../errors.js";
import { normalizePath } from "./normalizePath.js";
import { schemaHasPath } from "../schemaWalk.js";
import type { PaginationConfig, RestSpecConfig } from "../manifest.js";

const REST_METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
] as const;

type SpecOperation = {
  operationId?: string;
  deprecated?: boolean;
  requestBody?: { content?: Record<string, { schema?: unknown }> };
  responses?: Record<
    string,
    { content?: Record<string, { schema?: unknown }> }
  >;
  parameters?: Array<{ in?: string; name?: string }>;
};

type LocatedOperation = {
  path: string;
  method: (typeof REST_METHODS)[number];
  operation: SpecOperation;
};

/**
 * Finds an operation by operationId across all paths/methods of a bundled
 * OpenAPI spec.
 *
 * @param {Record<string, unknown>} spec The parsed OpenAPI snapshot
 * @param {string} operationId The operationId to locate
 * @returns {LocatedOperation} The operation with its path and method
 */
function locateOperation(
  spec: Record<string, unknown>,
  operationId: string,
): LocatedOperation {
  const paths = (spec.paths ?? {}) as Record<
    string,
    Record<string, SpecOperation>
  >;
  for (const [path, methods] of Object.entries(paths)) {
    for (const method of REST_METHODS) {
      const operation = methods[method];
      if (operation?.operationId === operationId) {
        return { path, method, operation };
      }
    }
  }
  // validateRestManifest runs first, so this indicates a walker bug.
  throw new CodegenError(`Operation "${operationId}" not found in spec.`);
}

/**
 * Picks the success response status key for an operation: "200" if present,
 * otherwise the first 2xx key.
 *
 * @param {SpecOperation} operation The spec operation
 * @param {string} operationId For error messages
 * @returns {{ status: string; contentType: string }} Status code and content type to index with
 */
function pickSuccessResponse(
  operation: SpecOperation,
  operationId: string,
): { status: string; contentType: string } {
  const responses = operation.responses ?? {};
  const status =
    "200" in responses
      ? "200"
      : Object.keys(responses).find((key) => /^2\d\d$/.test(key));
  if (!status) {
    throw new CodegenError(
      `Operation "${operationId}" has no 2xx response in the spec.`,
    );
  }
  const content = responses[status]?.content ?? {};
  const contentType =
    "application/json" in content
      ? "application/json"
      : Object.keys(content)[0];
  if (!contentType) {
    throw new CodegenError(
      `Operation "${operationId}" response ${status} has no content types.`,
    );
  }
  return { status, contentType };
}

/**
 * Validates a REST operation's declared pagination metadata against the spec:
 * the cursor param must exist among query params or body properties, and the
 * cursor/items fields must exist in the success response schema.
 *
 * @param {string} operationId For error messages
 * @param {SpecOperation} operation The located spec operation
 * @param {PaginationConfig} pagination The manifest's pagination declaration
 * @param {object} success The success response key to inspect
 * @param {string} success.status The 2xx status code key
 * @param {string} success.contentType The response content type key
 */
function validateRestPagination(
  operationId: string,
  operation: SpecOperation,
  pagination: PaginationConfig,
  success: { status: string; contentType: string },
): void {
  const bodySchema =
    operation.requestBody?.content?.["application/json"]?.schema;
  const inQuery = (operation.parameters ?? []).some(
    (param) => param.in === "query" && param.name === pagination.pageParam,
  );
  const inBody = bodySchema
    ? schemaHasPath(bodySchema, pagination.pageParam)
    : false;
  if (!inQuery && !inBody) {
    throw new CodegenError(
      `Operation "${operationId}": pagination pageParam "${pagination.pageParam}" not found among query params or body properties.`,
    );
  }

  const responseSchema =
    operation.responses?.[success.status]?.content?.[success.contentType]
      ?.schema;
  for (const field of [pagination.responseCursorField, pagination.itemsField]) {
    // Dotted paths supported: portfolio responses nest cursors under "data".
    if (!schemaHasPath(responseSchema, field)) {
      throw new CodegenError(
        `Operation "${operationId}": pagination field "${field}" not found in the ${success.status} response schema.`,
      );
    }
  }
}

/**
 * Emits the <spec>.schema.ts source for a REST spec: named Body/Response
 * (and optional Query) aliases indexed into the openapi-typescript output,
 * plus the RestRequestSchema tuple consumed by AlchemyRestClient.
 *
 * @param {RestSpecConfig} config The manifest entry for this spec
 * @param {Record<string, unknown>} spec The parsed OpenAPI snapshot
 * @returns {string} TypeScript source (unformatted, no banner)
 */
export function emitRestSchema(
  config: RestSpecConfig,
  spec: Record<string, unknown>,
): string {
  const aliasBlocks: string[] = [];
  const tupleEntries: string[] = [];

  for (const opConfig of config.operations) {
    const { operationId, exportBaseName, pagination } = opConfig;
    const { path, method, operation } = locateOperation(spec, operationId);
    if (operation.deprecated) {
      throw new CodegenError(
        `Operation "${operationId}" is marked deprecated in the spec. ` +
          `Drop it from the manifest, or map the replacement operation instead.`,
      );
    }
    const route = normalizePath(path, config.pathRules);
    const hasBody = operation.requestBody != null;
    const queryParams = (operation.parameters ?? []).filter(
      (param) => param.in === "query",
    );
    const hasQuery = queryParams.length > 0;
    const hasRequiredQuery = queryParams.some(
      (param) => (param as { required?: boolean }).required === true,
    );
    const { status, contentType } = pickSuccessResponse(operation, operationId);
    const opIndex = JSON.stringify(operationId);

    if (pagination) {
      validateRestPagination(operationId, operation, pagination, {
        status,
        contentType,
      });
    }

    if (hasBody) {
      const bodyContentType = Object.keys(
        operation.requestBody?.content ?? {},
      ).includes("application/json")
        ? "application/json"
        : Object.keys(operation.requestBody?.content ?? {})[0];
      aliasBlocks.push(
        `/** Request body for ${operationId}. */\n` +
          `export type ${exportBaseName}Body = NonNullable<\n` +
          `  operations[${opIndex}]["requestBody"]\n` +
          `>["content"][${JSON.stringify(bodyContentType)}];`,
      );
    }

    aliasBlocks.push(
      `/** ${status} response for ${operationId}. */\n` +
        `export type ${exportBaseName}Response =\n` +
        `  operations[${opIndex}]["responses"][${JSON.stringify(status)}]["content"][${JSON.stringify(contentType)}];`,
    );

    if (hasQuery) {
      aliasBlocks.push(
        `/** Query params for ${operationId}. */\n` +
          `export type ${exportBaseName}Query = NonNullable<\n` +
          `  operations[${opIndex}]["parameters"]["query"]\n` +
          `>;`,
      );
    }

    tupleEntries.push(
      `  {\n` +
        `    /** ${method.toUpperCase()} ${path} (operationId: ${operationId}) */\n` +
        `    Route: ${JSON.stringify(route)};\n` +
        `    Method: ${JSON.stringify(method.toUpperCase())};\n` +
        (hasBody
          ? `    Body: ${exportBaseName}Body;\n`
          : `    Body?: undefined;\n`) +
        (hasQuery
          ? hasRequiredQuery
            ? `    Query: ${exportBaseName}Query;\n`
            : `    Query?: ${exportBaseName}Query | undefined;\n`
          : `    Query?: undefined;\n`) +
        `    Response: ${exportBaseName}Response;\n` +
        `  },`,
    );
  }

  return [
    `import type { RestRequestSchema } from "@alchemy/common/core";`,
    `import type { operations } from "./${config.spec}.types.js";`,
    ``,
    ...aliasBlocks.map((block) => block + "\n"),
    `/** RestRequestSchema entries for the ${config.spec} REST API. */`,
    `export type ${config.schemaTypeName} = readonly [`,
    ...tupleEntries,
    `];`,
    ``,
    `/** Compile-time guard that the emitted tuple satisfies the shared constraint. */`,
    `export type _Assert${config.schemaTypeName} =`,
    `  ${config.schemaTypeName} extends RestRequestSchema ? true : never;`,
    ``,
  ].join("\n");
}

import { CodegenError } from "../errors.js";

/** JSON Schema node (loose — specs are already dereferenced). */
export type JsonSchema = Record<string, unknown>;

/** An OpenRPC method's extracted schemas, ready for type compilation. */
export type ExtractedMethod = {
  /** JSON-RPC method name (e.g. "alchemy_getAssetTransfers"). */
  name: string;
  /** Positional params: name, JSON Schema, and OpenRPC `required` flag (defaults false). */
  params: Array<{ name: string; required: boolean; schema: JsonSchema }>;
  /** Result JSON Schema. */
  result: JsonSchema;
};

/**
 * Recursively closes object schemas: sets `additionalProperties: false`
 * wherever it's unspecified so json-schema-to-typescript emits closed
 * interfaces instead of `[k: string]: unknown` index signatures. Returns a
 * deep copy; the input is not mutated.
 *
 * @param {unknown} node A JSON Schema node (or fragment)
 * @returns {unknown} The closed copy
 */
export function closeObjectSchemas(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(closeObjectSchemas);
  }
  if (node === null || typeof node !== "object") {
    return node;
  }
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    copy[key] = closeObjectSchemas(value);
  }
  const isObjectSchema =
    copy.type === "object" || copy.properties !== undefined;
  if (isObjectSchema && copy.additionalProperties === undefined) {
    copy.additionalProperties = false;
  }
  return copy;
}

/**
 * Extracts a method's param and result schemas from a bundled (dereferenced)
 * OpenRPC document, with object schemas closed for clean type compilation.
 *
 * @param {Record<string, unknown>} spec The parsed OpenRPC snapshot
 * @param {string} methodName The JSON-RPC method to extract
 * @returns {ExtractedMethod} The extracted schemas
 */
export function extractMethod(
  spec: Record<string, unknown>,
  methodName: string,
): ExtractedMethod {
  const methods = (spec.methods ?? []) as Array<{
    name?: string;
    params?: Array<{ name?: string; required?: boolean; schema?: JsonSchema }>;
    result?: { schema?: JsonSchema };
  }>;
  const method = methods.find((m) => m.name === methodName);
  if (!method) {
    // validateRpcManifest runs first, so this indicates a walker bug.
    throw new CodegenError(`Method "${methodName}" not found in spec.`);
  }

  const params = (method.params ?? []).map((param, index) => {
    if (!param.schema) {
      throw new CodegenError(
        `Method "${methodName}" param ${param.name ?? index} has no schema.`,
      );
    }
    return {
      name: param.name ?? `param${index}`,
      required: param.required === true,
      schema: closeObjectSchemas(param.schema) as JsonSchema,
    };
  });

  if (!method.result?.schema) {
    throw new CodegenError(`Method "${methodName}" has no result schema.`);
  }

  return {
    name: methodName,
    params,
    result: closeObjectSchemas(method.result.schema) as JsonSchema,
  };
}

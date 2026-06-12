import { compile } from "json-schema-to-typescript";
import { CodegenError } from "../errors.js";
import { schemaHasPath } from "../schemaWalk.js";
import { extractMethod, type ExtractedMethod } from "./openrpcWalker.js";
import type { PaginationConfig, RpcSpecConfig } from "../manifest.js";

/**
 * Converts a param name to PascalCase for type naming.
 *
 * @param {string} name The param name (e.g. "assetTransferParams")
 * @returns {string} PascalCase form
 */
function pascal(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Validates an RPC method's declared pagination metadata against the spec:
 * the cursor param path must resolve within one of the method's params
 * (dotted paths traverse nested object params, e.g. "options.pageKey" on
 * alchemy_getTokenBalances), and the cursor/items fields must exist in the
 * result schema (combinator branches included).
 *
 * @param {ExtractedMethod} extracted The extracted method schemas
 * @param {PaginationConfig} pagination The manifest's pagination declaration
 */
function validateRpcPagination(
  extracted: ExtractedMethod,
  pagination: PaginationConfig,
): void {
  const [head, ...rest] = pagination.pageParam.split(".");
  const param = extracted.params.find((p) => p.name === head);
  const paramOk =
    param != null &&
    (rest.length === 0 || schemaHasPath(param.schema, rest.join(".")));
  if (!paramOk) {
    throw new CodegenError(
      `Method "${extracted.name}": pagination pageParam "${pagination.pageParam}" not found among the method's params.`,
    );
  }
  for (const field of [pagination.responseCursorField, pagination.itemsField]) {
    if (!schemaHasPath(extracted.result, field)) {
      throw new CodegenError(
        `Method "${extracted.name}": pagination field "${field}" not found in the result schema.`,
      );
    }
  }
}

/**
 * Emits the <spec>.ts source for an OpenRPC spec: per-method param/result
 * types compiled from their JSON Schemas (json-schema-to-typescript), plus a
 * viem-shaped RpcSchema tuple so `client.request()` is fully typed.
 *
 * @param {RpcSpecConfig} config The manifest entry for this spec
 * @param {Record<string, unknown>} spec The parsed OpenRPC snapshot
 * @returns {Promise<string>} TypeScript source (unformatted, no banner)
 */
export async function emitRpcSchema(
  config: RpcSpecConfig,
  spec: Record<string, unknown>,
): Promise<string> {
  const typeBlocks: string[] = [];
  const tupleEntries: string[] = [];

  for (const methodConfig of config.methods) {
    const { method, exportBaseName, pagination } = methodConfig;
    const extracted = extractMethod(spec, method);
    if (pagination) {
      validateRpcPagination(extracted, pagination);
    }

    // Single-param methods get the plain "<Base>Params" name; multi-param
    // methods are disambiguated by param name.
    const paramTupleMembers: string[] = [];
    for (const param of extracted.params) {
      const typeName =
        extracted.params.length === 1
          ? `${exportBaseName}Params`
          : `${exportBaseName}${pascal(param.name)}Param`;
      const compiled = await compile(
        // json-schema-to-typescript names the root type from `title` when
        // present; pin the name we reference in the tuple instead.
        { ...param.schema, title: typeName },
        typeName,
        { bannerComment: "", format: false },
      );
      typeBlocks.push(compiled.trimEnd());
      paramTupleMembers.push(
        `${param.name}${param.required ? "" : "?"}: ${typeName}`,
      );
    }

    const resultTypeName = `${exportBaseName}Result`;
    const compiledResult = await compile(
      { ...extracted.result, title: resultTypeName },
      resultTypeName,
      { bannerComment: "", format: false },
    );
    typeBlocks.push(compiledResult.trimEnd());

    tupleEntries.push(
      `  {\n` +
        `    Method: ${JSON.stringify(method)};\n` +
        `    Parameters: [${paramTupleMembers.join(", ")}];\n` +
        `    ReturnType: ${resultTypeName};\n` +
        `  },`,
    );
  }

  return [
    ...typeBlocks.map((block) => block + "\n"),
    `/** viem RpcSchema entries for the ${config.spec} JSON-RPC methods. */`,
    `export type ${config.schemaTypeName} = [`,
    ...tupleEntries,
    `];`,
    ``,
  ].join("\n");
}

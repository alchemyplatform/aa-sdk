import openapiTS, { astToString } from "openapi-typescript";

/**
 * Runs openapi-typescript over a bundled (dereferenced) OpenAPI document and
 * returns the generated source (paths/components/operations interfaces).
 *
 * @param {Record<string, unknown>} spec The parsed OpenAPI snapshot
 * @returns {Promise<string>} Generated TypeScript source (unformatted, no banner)
 */
export async function generateOpenapiTypes(
  spec: Record<string, unknown>,
): Promise<string> {
  // openapi-typescript accepts an in-memory document; snapshots are already
  // dereferenced by the docs repo's bundling, so no $ref resolution happens here.
  const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0]);
  return astToString(ast);
}

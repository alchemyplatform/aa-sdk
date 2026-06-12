/**
 * Checks whether a JSON Schema declares a property, looking through
 * oneOf/anyOf/allOf combinators (the transfers result, for example, is a
 * oneOf whose object branch carries pageKey/transfers).
 *
 * @param {unknown} schema A JSON Schema node
 * @param {string} property The property name to find
 * @returns {boolean} true if any (combinator) branch declares the property
 */
export function schemaHasProperty(schema: unknown, property: string): boolean {
  if (schema === null || typeof schema !== "object") return false;
  const node = schema as Record<string, unknown>;
  const properties = node.properties as Record<string, unknown> | undefined;
  if (properties && property in properties) return true;
  for (const combinator of ["oneOf", "anyOf", "allOf"] as const) {
    const branches = node[combinator];
    if (Array.isArray(branches)) {
      if (branches.some((branch) => schemaHasProperty(branch, property))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Resolves a dotted property path within a JSON Schema's properties
 * (e.g. "options.pageKey" → properties.options.properties.pageKey).
 *
 * @param {unknown} schema A JSON Schema node
 * @param {string} path Dotted property path
 * @returns {boolean} true if the full path resolves
 */
export function schemaHasPath(schema: unknown, path: string): boolean {
  const [head, ...rest] = path.split(".");
  if (!head) return false;
  if (schema === null || typeof schema !== "object") return false;
  const properties = (schema as Record<string, unknown>).properties as
    | Record<string, unknown>
    | undefined;
  if (!properties || !(head in properties)) {
    // Look through combinators at this level too.
    for (const combinator of ["oneOf", "anyOf", "allOf"] as const) {
      const branches = (schema as Record<string, unknown>)[combinator];
      if (Array.isArray(branches)) {
        if (branches.some((branch) => schemaHasPath(branch, path))) {
          return true;
        }
      }
    }
    return false;
  }
  if (rest.length === 0) return true;
  return schemaHasPath(properties[head], rest.join("."));
}

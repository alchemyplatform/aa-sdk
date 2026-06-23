/**
 * Error type for all failures raised by the codegen tool (manifest/spec
 * mismatches, lockfile checksum failures, malformed specs).
 */
export class CodegenError extends Error {
  override name = "CodegenError";
}

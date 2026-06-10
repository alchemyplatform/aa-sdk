import { pathToFileURL } from "node:url";
import { CodegenError } from "./errors.js";

/** Path → Route normalization rules for a REST spec (see normalizePath). */
export type PathRules = {
  /** Drop `{apiKey}` path segments (runtime auth is header-based). Default true. */
  stripApiKeySegment?: boolean;
  /** Prefix already present in the runtime base URL (e.g. "/v3" for NFT). */
  stripPrefix?: string;
};

/** A single OpenAPI operation the target consumes. */
export type RestOperationConfig = {
  /** operationId as it appears in the spec (e.g. "getNFTsForOwner-v3"). */
  operationId: string;
  /** Base for emitted type names (e.g. "GetNftsForOwner" → GetNftsForOwnerResponse). */
  exportBaseName: string;
  /** Also emit a named query-params type (GET endpoints; RestRequestSchema has no query channel). */
  emitQueryType?: boolean;
};

/** One REST spec consumed by the target. */
export type RestSpecConfig = {
  /** Snapshot basename without extension (specs/<spec>.json). */
  spec: string;
  /** Name of the emitted RestRequestSchema tuple type (e.g. "PortfolioRestSchema"). */
  schemaTypeName: string;
  pathRules?: PathRules;
  operations: RestOperationConfig[];
};

/** A single OpenRPC method the target consumes. */
export type RpcMethodConfig = {
  /** JSON-RPC method name as it appears in the spec (e.g. "alchemy_getAssetTransfers"). */
  method: string;
  /** Base for emitted type names (e.g. "AlchemyGetAssetTransfers"). */
  exportBaseName: string;
};

/** One OpenRPC spec consumed by the target. */
export type RpcSpecConfig = {
  /** Snapshot basename without extension (specs/<spec>.json). */
  spec: string;
  /** Name of the emitted viem RpcSchema tuple type (e.g. "TransfersRpcSchema"). */
  schemaTypeName: string;
  methods: RpcMethodConfig[];
};

/**
 * The per-target overlay manifest: the hand-maintained mapping from spec
 * operations to the SDK's generated type surface. Validated against the spec
 * snapshots on every generate run — a referenced operation missing from the
 * snapshot is a hard error (the drift alarm).
 */
export type CodegenManifest = {
  rest: RestSpecConfig[];
  rpc: RpcSpecConfig[];
};

/**
 * Loads a target's codegen.manifest.ts (default export).
 *
 * @param {string} manifestPath Absolute path to the manifest module
 * @returns {Promise<CodegenManifest>} The manifest
 */
export async function loadManifest(
  manifestPath: string,
): Promise<CodegenManifest> {
  const mod = await import(pathToFileURL(manifestPath).href);
  const manifest = mod.default as CodegenManifest | undefined;
  if (
    !manifest ||
    !Array.isArray(manifest.rest) ||
    !Array.isArray(manifest.rpc)
  ) {
    throw new CodegenError(
      `Manifest at ${manifestPath} must default-export a CodegenManifest ({ rest, rpc }).`,
    );
  }
  return manifest;
}

/**
 * Validates that every operationId a REST manifest entry references exists in
 * the spec snapshot, and reports spec operations the manifest doesn't cover.
 *
 * @param {RestSpecConfig} config The manifest entry for this spec
 * @param {Record<string, unknown>} spec The parsed OpenAPI snapshot
 * @returns {string[]} operationIds present in the spec but not in the manifest (new-endpoint visibility)
 */
export function validateRestManifest(
  config: RestSpecConfig,
  spec: Record<string, unknown>,
): string[] {
  const specOperationIds = new Set<string>();
  const paths = (spec.paths ?? {}) as Record<
    string,
    Record<string, { operationId?: string }>
  >;
  for (const methods of Object.values(paths)) {
    for (const op of Object.values(methods)) {
      if (op && typeof op === "object" && op.operationId) {
        specOperationIds.add(op.operationId);
      }
    }
  }

  const missing = config.operations
    .map((o) => o.operationId)
    .filter((id) => !specOperationIds.has(id));
  if (missing.length > 0) {
    throw new CodegenError(
      `Spec "${config.spec}" no longer contains operationId(s) referenced by the manifest: ${missing.join(", ")}. ` +
        `The upstream spec was likely renamed or removed — update the manifest (and the SDK surface) deliberately.`,
    );
  }

  const covered = new Set(config.operations.map((o) => o.operationId));
  return [...specOperationIds].filter((id) => !covered.has(id)).sort();
}

/**
 * Validates that every RPC method a manifest entry references exists in the
 * OpenRPC snapshot, and reports spec methods the manifest doesn't cover.
 *
 * @param {RpcSpecConfig} config The manifest entry for this spec
 * @param {Record<string, unknown>} spec The parsed OpenRPC snapshot
 * @returns {string[]} methods present in the spec but not in the manifest
 */
export function validateRpcManifest(
  config: RpcSpecConfig,
  spec: Record<string, unknown>,
): string[] {
  const specMethods = new Set(
    ((spec.methods ?? []) as Array<{ name?: string }>)
      .map((m) => m.name)
      .filter((name): name is string => typeof name === "string"),
  );

  const missing = config.methods
    .map((m) => m.method)
    .filter((name) => !specMethods.has(name));
  if (missing.length > 0) {
    throw new CodegenError(
      `Spec "${config.spec}" no longer contains RPC method(s) referenced by the manifest: ${missing.join(", ")}. ` +
        `The upstream spec was likely renamed or removed — update the manifest (and the SDK surface) deliberately.`,
    );
  }

  const covered = new Set(config.methods.map((m) => m.method));
  return [...specMethods].filter((name) => !covered.has(name)).sort();
}

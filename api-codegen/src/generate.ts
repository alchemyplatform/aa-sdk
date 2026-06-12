import { resolve } from "node:path";
import { CodegenError } from "./errors.js";
import { formatGenerated } from "./format.js";
import {
  loadManifest,
  validateRestManifest,
  validateRpcManifest,
} from "./manifest.js";
import { REPO_ROOT } from "./paths.js";
import { emitRestSchema } from "./rest/schemaEmitter.js";
import { generateOpenapiTypes } from "./rest/openapiTypes.js";
import { emitRpcSchema } from "./rpc/rpcEmitter.js";
import { readSnapshot } from "./snapshot.js";
import { TARGETS } from "./targets.js";
import { writeIfChanged } from "./write.js";

/**
 * Formats and writes one generated file, logging the outcome.
 *
 * @param {string} outputPath Absolute output path
 * @param {string} source Generated source (unformatted, no banner)
 */
async function emitFile(outputPath: string, source: string): Promise<void> {
  const formatted = await formatGenerated(source, outputPath);
  const wrote = writeIfChanged(outputPath, formatted);
  console.log(
    `  ${outputPath.replace(REPO_ROOT + "/", "")} ${wrote ? "written" : "unchanged"}`,
  );
}

/**
 * Generates a target's `src/generated/` internals from the committed spec
 * snapshots (offline + deterministic). Hard-errors if the target's manifest
 * references operations/methods missing from the snapshots.
 *
 * @param {string} targetName A key of TARGETS (e.g. "data-apis")
 */
export async function generate(targetName: string): Promise<void> {
  const target = TARGETS[targetName];
  if (!target) {
    throw new CodegenError(
      `Unknown target "${targetName}". Registered: ${Object.keys(TARGETS).join(", ")}.`,
    );
  }
  const packageDir = resolve(REPO_ROOT, target.packageDir);
  const outputDir = resolve(packageDir, target.outputDir);
  const manifest = await loadManifest(resolve(packageDir, target.manifestPath));
  console.log(`Generating ${target.packageDir}/${target.outputDir} ...`);

  for (const restConfig of manifest.rest) {
    const spec = readSnapshot(restConfig.spec);
    const uncovered = validateRestManifest(restConfig, spec);
    if (uncovered.length > 0) {
      console.warn(
        `  note: spec "${restConfig.spec}" has ${uncovered.length} operation(s) not in the manifest: ${uncovered.join(", ")}`,
      );
    }
    await emitFile(
      resolve(outputDir, `rest/${restConfig.spec}.types.ts`),
      await generateOpenapiTypes(spec),
    );
    await emitFile(
      resolve(outputDir, `rest/${restConfig.spec}.schema.ts`),
      emitRestSchema(restConfig, spec),
    );
  }

  for (const rpcConfig of manifest.rpc) {
    const spec = readSnapshot(rpcConfig.spec);
    const uncovered = validateRpcManifest(rpcConfig, spec);
    if (uncovered.length > 0) {
      console.warn(
        `  note: spec "${rpcConfig.spec}" has ${uncovered.length} method(s) not in the manifest: ${uncovered.join(", ")}`,
      );
    }
    await emitFile(
      resolve(outputDir, `rpc/${rpcConfig.spec}.ts`),
      await emitRpcSchema(rpcConfig, spec),
    );
  }
}

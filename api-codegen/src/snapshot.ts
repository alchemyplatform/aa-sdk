import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CodegenError } from "./errors.js";
import { sha256 } from "./hash.js";
import { loadManifest } from "./manifest.js";
import { LOCKFILE_PATH, REPO_ROOT, SPECS_DIR } from "./paths.js";
import { TARGETS } from "./targets.js";
import { writeIfChanged } from "./write.js";

/** The shape of specs.lock.json: docs provenance + per-snapshot checksums. */
export type SpecsLockfile = {
  docs: { repository: string; sha: string; branch: string };
  specs: Record<string, string>;
};

type SnapshotOptions = {
  /** Local docs checkout. Falls back to ALCHEMY_DOCS_DIR, then ../docs next to the repo. */
  docsDir?: string;
  /** Skip the clean-working-tree requirement on the docs checkout. */
  allowDirty?: boolean;
};

/**
 * Runs a git command in the docs checkout and returns trimmed stdout.
 *
 * @param {string} docsDir The docs checkout directory
 * @param {string[]} args git arguments
 * @returns {string} Trimmed stdout
 */
function git(docsDir: string, args: string[]): string {
  return execFileSync("git", ["-C", docsDir, ...args], {
    encoding: "utf8",
  }).trim();
}

/**
 * Collects the union of spec names (by channel) referenced by all registered
 * targets' manifests — the single source of truth for what gets snapshotted.
 *
 * @returns {Promise<{ rest: string[]; rpc: string[] }>} Spec basenames per channel
 */
async function collectSpecNames(): Promise<{ rest: string[]; rpc: string[] }> {
  const rest = new Set<string>();
  const rpc = new Set<string>();
  for (const target of Object.values(TARGETS)) {
    const manifest = await loadManifest(
      resolve(REPO_ROOT, target.packageDir, target.manifestPath),
    );
    for (const entry of manifest.rest) rest.add(entry.spec);
    for (const entry of manifest.rpc) rpc.add(entry.spec);
  }
  return { rest: [...rest].sort(), rpc: [...rpc].sort() };
}

/**
 * Snapshots bundled specs from a local docs checkout into specs/ and writes
 * specs.lock.json. Bundling uses the docs repo's own tooling: redocly per
 * OpenAPI spec (mirroring its generate-open-api.sh invocation) and its
 * generate:rpc script for OpenRPC.
 *
 * @param {SnapshotOptions} options Docs checkout location and dirty-tree override
 */
export async function snapshot(options: SnapshotOptions = {}): Promise<void> {
  const docsDir = resolve(
    options.docsDir ??
      process.env.ALCHEMY_DOCS_DIR ??
      resolve(REPO_ROOT, "../docs"),
  );
  if (!existsSync(resolve(docsDir, "package.json"))) {
    throw new CodegenError(
      `No docs checkout at ${docsDir}. Pass --docs <dir> or set ALCHEMY_DOCS_DIR.`,
    );
  }

  const status = git(docsDir, ["status", "--porcelain"]);
  if (status !== "" && !options.allowDirty) {
    throw new CodegenError(
      `Docs checkout at ${docsDir} has uncommitted changes; commit/stash them or pass --allow-dirty.\n${status}`,
    );
  }
  const sha = git(docsDir, ["rev-parse", "HEAD"]);
  const branchName = git(docsDir, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const branch = branchName === "HEAD" ? "(detached)" : branchName;

  const { rest, rpc } = await collectSpecNames();
  console.log(
    `Snapshotting from docs@${sha.slice(0, 9)} (${branch}): rest=[${rest.join(", ")}] rpc=[${rpc.join(", ")}]`,
  );

  // REST: bundle each spec with the same redocly invocation the docs repo's
  // generate-open-api.sh uses (skipping its remote-spec fetches and lint pass).
  for (const name of rest) {
    execFileSync(
      "pnpm",
      [
        "exec",
        "redocly",
        "bundle",
        `src/openapi/${name}/${name}.yaml`,
        "--dereferenced",
        "--output",
        `content/api-specs/alchemy/rest/${name}.json`,
        "--ext",
        "json",
        "--remove-unused-components",
      ],
      { cwd: docsDir, stdio: "inherit" },
    );
  }

  // OpenRPC: the docs script generates all RPC specs in one pass (offline).
  if (rpc.length > 0) {
    execFileSync("pnpm", ["run", "generate:rpc"], {
      cwd: docsDir,
      stdio: "inherit",
    });
  }

  const checksums: Record<string, string> = {};
  const copies: Array<{ name: string; sourcePath: string }> = [
    ...rest.map((name) => ({
      name,
      sourcePath: resolve(
        docsDir,
        `content/api-specs/alchemy/rest/${name}.json`,
      ),
    })),
    ...rpc.map((name) => ({
      name,
      sourcePath: resolve(
        docsDir,
        `content/api-specs/alchemy/json-rpc/${name}.json`,
      ),
    })),
  ];
  for (const { name, sourcePath } of copies.sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!existsSync(sourcePath)) {
      throw new CodegenError(`Expected bundled spec at ${sourcePath}.`);
    }
    // Normalize through a single stringify so snapshot formatting never
    // depends on the docs tooling's serializer.
    const normalized =
      JSON.stringify(JSON.parse(readFileSync(sourcePath, "utf8")), null, 2) +
      "\n";
    const snapshotPath = resolve(SPECS_DIR, `${name}.json`);
    const wrote = writeIfChanged(snapshotPath, normalized);
    checksums[`${name}.json`] = sha256(normalized);
    console.log(`  specs/${name}.json ${wrote ? "updated" : "unchanged"}`);
  }

  const lockfile: SpecsLockfile = {
    docs: { repository: "alchemyplatform/docs", sha, branch },
    specs: checksums,
  };
  const wroteLock = writeIfChanged(
    LOCKFILE_PATH,
    JSON.stringify(lockfile, null, 2) + "\n",
  );
  console.log(`  specs/specs.lock.json ${wroteLock ? "updated" : "unchanged"}`);
}

/**
 * Reads a committed spec snapshot, verifying its checksum against the
 * lockfile. Generate-time guard against hand-edited snapshots.
 *
 * @param {string} name Spec basename without extension
 * @returns {Record<string, unknown>} The parsed spec
 */
export function readSnapshot(name: string): Record<string, unknown> {
  const snapshotPath = resolve(SPECS_DIR, `${name}.json`);
  if (!existsSync(snapshotPath)) {
    throw new CodegenError(
      `Missing spec snapshot specs/${name}.json — run \`pnpm --filter @alchemy/api-codegen snapshot\`.`,
    );
  }
  const content = readFileSync(snapshotPath, "utf8");
  const lockfile = JSON.parse(
    readFileSync(LOCKFILE_PATH, "utf8"),
  ) as SpecsLockfile;
  const expected = lockfile.specs[`${name}.json`];
  if (!expected) {
    throw new CodegenError(
      `specs/${name}.json is not in specs.lock.json — re-run snapshot.`,
    );
  }
  if (sha256(content) !== expected) {
    throw new CodegenError(
      `Checksum mismatch for specs/${name}.json — the snapshot was modified outside the snapshot command. Re-run snapshot.`,
    );
  }
  return JSON.parse(content) as Record<string, unknown>;
}

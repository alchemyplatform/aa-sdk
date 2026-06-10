/** A consuming package wired into the codegen pipeline. */
export type TargetConfig = {
  /** Package directory, relative to the repo root. */
  packageDir: string;
  /** Manifest module path, relative to the package directory. */
  manifestPath: string;
  /** Generated-output directory, relative to the package directory. */
  outputDir: string;
};

/** All registered codegen targets, keyed by `--target` name. */
export const TARGETS: Record<string, TargetConfig> = {
  "data-apis": {
    packageDir: "packages/data-apis",
    manifestPath: "codegen.manifest.ts",
    outputDir: "src/generated",
  },
};

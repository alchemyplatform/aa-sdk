export function packageJsonTemplate(packageName: string, description: string) {
  return {
    name: `@alchemy/${packageName}`,
    version: "0.0.0",
    description: description,
    author: "Alchemy",
    license: "MIT",
    private: false,
    type: "module",
    main: "./dist/esm/index.js",
    module: "./dist/esm/index.js",
    types: "./dist/types/index.d.ts",
    typings: "./dist/types/index.d.ts",
    sideEffects: false,
    files: [
      "dist",
      "src/**/*.ts",
      "!dist/**/*.tsbuildinfo",
      "!vitest.config.ts",
      "!.env",
      "!src/**/*.test.ts",
      "!src/**/*.test-d.ts",
      "!src/__tests__/**/*",
    ],
    exports: {
      ".": {
        types: "./dist/types/index.d.ts",
        import: "./dist/esm/index.js",
        default: "./dist/esm/index.js",
      },
      "./package.json": "./package.json",
    },
    scripts: {
      prebuild: "tsx ./inject-version.ts",
      build: "yarn clean && yarn build:esm && yarn build:types",
      "build:esm": "tsc --project tsconfig.build.json --outDir ./dist/esm",
      "build:types":
        "tsc --project tsconfig.build.json --declarationDir ./dist/types --emitDeclarationOnly --declaration --declarationMap",
      "fern:gen": `node ../../doc-gen/dist/esm/cli.js generate --in ./src/index.ts --out ../../docs/pages/reference/alchemy/${packageName}`,
      clean: "rm -rf ./dist",
      test: "vitest",
      "test:run": "vitest run",
    },
    devDependencies: {
      "typescript-template": "*",
    },
    dependencies: {
      // TODO: this needs to be given a proper version, but it might be that lerna will handle this for you on publish
      "@alchemy/common": "*",
      viem: "2.29.2",
    },
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/alchemyplatform/aa-sdk.git",
    },
    bugs: {
      url: "https://github.com/alchemyplatform/aa-sdk/issues",
    },
    homepage: "https://github.com/alchemyplatform/aa-sdk#readme",
  };
}

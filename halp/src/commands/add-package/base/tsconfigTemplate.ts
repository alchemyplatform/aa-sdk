export function tsconfigTemplate() {
  return {
    extends: "typescript-template/base.json",
    compilerOptions: {
      jsx: "preserve",
      paths: {
        "~test/*": ["../../.vitest/src/*"],
      },
    },
  };
}

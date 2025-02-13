// https://github.com/wevm/wagmi/blob/main/packages/cli/src/utils/format.ts
import prettier from "prettier";

export async function format(content: string) {
  const config = await prettier.resolveConfig(process.cwd());
  return prettier.format(content, {
    parser: "typescript",
    ...config,
    plugins: [],
  });
}

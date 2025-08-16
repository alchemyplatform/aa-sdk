import dedent from "dedent";

export function vitestConfigTemplate(packageName: string) {
  return dedent`
    import { defineProject, mergeConfig } from "vitest/config";
    import { sharedConfig } from "../../.vitest/vitest.shared";

    export default mergeConfig(
        // @ts-ignore this does work
        sharedConfig,
        defineProject({
            test: {
            name: "alchemy/${packageName}",
            },
        }),
    );
    `;
}

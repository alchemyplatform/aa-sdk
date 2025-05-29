/**
 * Converts an object of options to an array of command line arguments.
 *
 * @param options The options object.
 * @returns The command line arguments.
 */
export function toArgs(
  obj: {
    [key: string]:
      | Record<string, any>
      | string
      | readonly string[]
      | boolean
      | number
      | bigint
      | undefined;
  },
  options: { casing: "kebab" | "snake" } = { casing: "kebab" },
) {
  const { casing } = options;
  return Object.entries(obj).flatMap(([key, value]) => {
    if (value === undefined) return [];

    if (Array.isArray(value)) return [toFlagCase(key), value.join(",")];

    if (typeof value === "object" && value !== null) {
      return Object.entries(value).flatMap(([subKey, subValue]) => {
        if (subValue === undefined) return [];
        const flag = toFlagCase(
          `${key}.${subKey}`,
          casing === "kebab" ? "-" : "_",
        );
        return [flag, Array.isArray(subValue) ? subValue.join(",") : subValue];
      });
    }

    const flag = toFlagCase(key, casing === "kebab" ? "-" : "_");

    if (value === false) return [flag, "false"];
    if (value === true) return [flag];

    const stringified = value.toString();
    if (stringified === "") return [flag];

    return [flag, stringified];
  });
}

/** Converts to a --flag-case string. */
export function toFlagCase(str: string, separator = "-") {
  const keys = [];
  for (let i = 0; i < str.split(".").length; i++) {
    const key = str.split(".")[i];
    if (!key) continue;
    keys.push(
      key
        .replace(/\s+/g, separator)
        .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
        .toLowerCase(),
    );
  }
  return `--${keys.join(".")}`;
}

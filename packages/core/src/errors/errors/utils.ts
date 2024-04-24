export type ErrorType<name extends string = "Error"> = Error & { name: name }

export function prettyPrint(
    args: Record<string, bigint | number | string | undefined | false | unknown>
) {
    const entries = Object.entries(args)
        .map(([key, value]) => {
            if (value === undefined || value === false) return null
            return [key, value]
        })
        .filter(Boolean) as [string, string][]
    const maxLength = entries.reduce(
        (acc, [key]) => Math.max(acc, key.length),
        0
    )
    return entries
        .map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`)
        .join("\n")
}

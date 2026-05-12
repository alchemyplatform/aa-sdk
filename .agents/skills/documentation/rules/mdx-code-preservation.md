# MDX Code Preservation

Do not change code snippet behavior while editing documentation.

## Why

Existing docs reviewer instructions explicitly forbid changing function names,
type values, property names, import statements, variable assignments, and string
literals that affect functionality. Documentation style is lower priority than
working code.

## Good

- Fix indentation and spacing.
- Add or correct language tags.
- Update comments for clarity.

## Bad

- Renaming SDK APIs in snippets for style.
- Replacing package imports with paths that are not exported.
- Changing object property names in example calls.

## Exceptions

If a code snippet is wrong because the SDK API changed, verify the API in source
first and update the snippet deliberately, not as a style rewrite.

# TypeDoc to docs.yml Generator

This directory contains scripts for generating documentation structure for the Alchemy SDK.

## generate-typedoc-yaml.ts

A TypeScript script that automatically generates and updates the SDK Reference section in `docs.yml` from TypeDoc-generated MDX files.

### Overview

The script scans the TypeDoc output directory (`docs/pages/reference/typedoc/`) and automatically updates the SDK Reference section in `docs/docs.yml`. It organizes the generated MDX files into logical sections based on their type (Functions, Classes, Components, Hooks, etc.) and package structure, then directly replaces the existing SDK Reference section in the documentation configuration.

### Features

- **Automatic Package Detection**: Scans both `aa-sdk` and `account-kit` packages
- **Smart Categorization**: Separates React components, hooks, and functions appropriately
- **Proper Display Names**: Maps technical package names to user-friendly display names
- **Special Handling**: Handles unique directory structures like `wallet-client/exports`
- **Complete Coverage**: Includes all TypeDoc-generated content types:
  - Functions
  - Classes
  - Components (React)
  - Hooks (React)
  - Interfaces
  - Enumerations
  - Type Aliases
  - Variables

### Package Mapping

The script maps technical package names to user-friendly display names:

**aa-sdk packages:**

- `aa-sdk/core` → "AA-SDK core"
- `aa-sdk/ethers` → "AA-SDK ethers"

**account-kit packages:**

- `account-kit/core` → "Other Javascript Frameworks"
- `account-kit/infra` → "Infra"
- `account-kit/react` → "React"
- `account-kit/react-native` → "React Native"
- `account-kit/rn-signer` → "RN Signer"
- `account-kit/signer` → "Signer"
- `account-kit/smart-contracts` → "Smart contracts"
- `account-kit/wallet-client` → "Wallet client"

### Usage

1. **Generate TypeDoc files** (if not already done):

   ```bash
   npm run typedoc
   ```

2. **Run the script**:

   ```bash
   npx tsx scripts/generate-typedoc-yaml.ts
   ```

3. **Automatic update**:
   - The script automatically updates the SDK Reference section in `docs/docs.yml`
   - No manual copying or pasting required
   - The existing file structure is preserved

### How It Works

The script:

1. **Scans** the TypeDoc output directory for all generated MDX files
2. **Organizes** them by package and type (Functions, Classes, Components, Hooks, etc.)
3. **Locates** the existing SDK Reference section in `docs.yml`
4. **Replaces** it with the newly generated structure
5. **Preserves** all other content in the file

### Generated Structure

The updated YAML follows this structure:

```yaml
section: SDK Reference
contents:
  - section: AA-SDK core
    path: wallets/pages/reference/typedoc/aa-sdk/core/src/README.mdx
    contents:
      - section: Functions
        contents:
          - page: allEqual
            path: wallets/pages/reference/typedoc/aa-sdk/core/src/functions/allEqual.mdx
      - section: Classes
        contents:
          - page: AccountNotFoundError
            path: wallets/pages/reference/typedoc/aa-sdk/core/src/classes/AccountNotFoundError.mdx
  - section: React
    path: wallets/pages/reference/typedoc/account-kit/react/src/README.mdx
    contents:
      - section: Components
        contents:
          - page: AlchemyAccountProvider
            path: wallets/pages/reference/typedoc/account-kit/react/src/functions/AlchemyAccountProvider.mdx
      - section: Hooks
        contents:
          - page: useAccount
            path: wallets/pages/reference/typedoc/account-kit/react/src/functions/useAccount.mdx
```

### Special Handling

**React Components vs Functions**: The script automatically detects React components (functions that start with uppercase letters) and places them in a separate "Components" section instead of the general "Functions" section.

**React Hooks**: Functions starting with "use" in React packages are automatically categorized as "Hooks".

**Wallet Client**: The `wallet-client` package has a unique directory structure with an `exports` subdirectory. The script handles this special case automatically.

**Class Methods**: For classes with multiple methods, the script creates nested sections (though currently TypeDoc generates flat class files).

### Troubleshooting

**Missing packages**: If a package isn't appearing in the updated docs.yml, check:

1. The package has a `src` directory
2. The `src` directory contains MDX files
3. The package isn't being filtered out by the directory skip list

**Incorrect categorization**: If functions are being categorized incorrectly:

1. Check the `isReactComponent()` function logic
2. Verify the package name detection
3. Update the special cases in `toDisplayName()` if needed

**Update issues**: If the docs.yml file isn't being updated correctly:

1. Verify the SDK Reference section exists in the file
2. Check that the file is writable
3. Ensure the section boundaries are detected correctly

**Path issues**: If paths are incorrect:

1. Verify the TypeDoc output directory structure
2. Check the `fullPackagePath` construction
3. Ensure the `wallets/pages/reference/typedoc/` prefix is correct

### Customization

To modify the script behavior:

1. **Change display names**: Update `PACKAGE_DISPLAY_NAMES` object
2. **Add new type sections**: Update `TYPE_SECTIONS` object
3. **Modify categorization**: Update `isReactComponent()` function
4. **Handle new special cases**: Add logic in the package processing loop

### Dependencies

- `tsx` - For running TypeScript files directly (install with `npm install --save-dev tsx`)
- Node.js built-in modules: `fs`, `path`

### Type Safety

The TypeScript version includes comprehensive type definitions for:

- File and directory structures (`FileItem`, `DirectoryItem`, `ScanItem`)
- YAML output structures (`YamlPage`, `YamlSection`, `YamlPackageSection`, `SDKReference`)
- Configuration objects (`PackageDisplayNames`, `TypeSections`)

This ensures type safety throughout the generation process and makes the code more maintainable.

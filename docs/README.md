# Smart Wallets Documentation

This repository contains the documentation for Smart Wallets that gets published to [alchemy.com/docs](https://alchemy.com/docs) which is built using [Fern](https://buildwithfern.com/learn/docs/getting-started/overview).

The contents are automatically merged with [Alchemy's Official Docs repo](https://github.com/alchemyplatform/docs) to create seamless updates without needing to make changes separately in that repo.

## Structure

```text
aa-sdk/
├── docs/                # This project
│   ├── docs.yml         # The main configuration file that defines the documentation structure and sidebar navigation
│   ├── pages/           # Contains the documentation markdown files
│   ├── images/          # Contains images used in the documentation
│   ├── components/      # Contains the all custom React components used in markdown
|   ├── specs/           # Contains OpenRPC and OpenAPI spec definitions which are dereferenced during build
|   └── api-generators/  # Contains generators.yaml files used by Fern to reference API specs
└── docs-site/           # Git Submodule containing Fern and all non-wallet docs content
```

> \[!WARNING]
> If you want to make changes to content outside the Wallets tab, please do so in the main [Alchemy Docs repo](https://github.com/alchemyplatform/docs). See its [README](https://github.com/alchemyplatform/docs?tab=readme-ov-file#alchemy-documentation) and [contributing guidelines](https://github.com/alchemyplatform/docs/blob/main/CONTRIBUTING.md) for more information.

## Making Updates

### Docs Content

To add or modify documentation content:

- Add/edit markdown files in the `pages/` directory
- Follow the existing markdown formatting conventions. Fern uses [Github-flavored Markdown](https://github.github.com/gfm/)
- You may use any [existing Fern components](https://buildwithfern.com/learn/docs/content/components/overview)
  - Do **not** use `import`/`require` statements in MDX. Fern injects these for you.

To add new pages to navigation:

- Update the `navigation` section in `docs.yml`
- Reference markdown files from `pages/` by path using `wallets/pages`

### Images

To add new images:

- Place image files in the `images/` directory
- Use descriptive filenames
- Reference images from the `images/` directory in markdown using `images/wallets/filename.png`
- You may use [markdown syntax or `img` tags](https://buildwithfern.com/learn/docs/content/write-markdown#images)

### SDK References

SDK References are automatically generated from relevant projects within the monorepo via the `docs-gen` package. Both the markdown files and the sidebar structure in `docs/docs.yml` are generated and should **not** be edited manually. In the root, to generate references from code you can run:

```shell
yarn fern:gen
```

### Injected Code Snippets

You can reference production code directly in code snippets using `[!include]` statements. The syntax is the same as Physical File Snippets from Vocs, so you can reference [their documentation](https://vocs.dev/docs/guides/code-snippets#physical-file-snippets).

## Local Development

To run docs locally, you must have `pnpm` installed as a global dependency. `corepack` can install it for you. Run:

```bash
asdf install # or `mise install`
corepack enable
```

Then to start the dev server, run:

```bash
yarn docs:dev
```

This will install dependencies, temporarily move files into `docs-site`, and keep the submodule updated for you.

## Preview Changes

1. Create a pull request with your changes
2. The CI will automatically generate a preview URL in the PR comments
3. Review the preview to ensure your changes appear as expected

## Publishing

Documentation changes are automatically published to [alchemy.com/docs](https://alchemy.com/docs) when merged to the `main` branch.

## Technical Details

- The `scripts/insert-docs.sh` script is run during local and during CI/CD from both [aa-sdk](https://github.com/alchemyplatform/aa-sdk/) and [docs](https://github.com/alchemyplatform/docs) repos. It handles:
  - Inserting Smart Wallets documentation configuration into the main docs site config
  - Moving images and API specs to the correct locations in the main docs repo
- Documentation is built and published using [Fern CLI](https://buildwithfern.com/learn/cli-reference/overview#setting-up-docs)

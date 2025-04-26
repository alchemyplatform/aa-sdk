# Account Kit Documentation

This repository contains the documentation for Account Kit that gets published to [alchemy.com/docs](https://alchemy.com/docs) which is built using [Fern](https://buildwithfern.com/learn/docs/getting-started/overview).

The contents are automatically merged with [Alchemy's Official Docs repo](https://github.com/alchemyplatform/docs) to create seamless updates without needing to make changes separately in that repo.

## Structure

- `docs.yml` - The main configuration file that defines the documentation structure and sidebar navigation
- `pages/` - Directory containing the documentation markdown files
- `images/` - Directory containing images used in the documentation

## Making Updates

### Docs Content

To add or modify documentation content:

- Add/edit markdown files in the `pages/` directory
- Follow the existing markdown formatting conventions. Fern uses [Github-flavored Markdown](https://github.github.com/gfm/)
- You may use any [existing Fern components](https://buildwithfern.com/learn/docs/content/components/overview) without import statements

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

SDK Refernces are automatically generated from relevant projects within the monorepo via the `docs-gen` package. In the root, run:

```shell
yarn fern-gen
```

### Local Development

**TBD:** Currently this would require distributing a GitHub Token to access Alchemy Docs repo. Will remove this requirement once those docs go live.

### Preview Changes

1. Create a pull request with your changes
2. The CI will automatically generate a preview URL in the PR comments
3. Review the preview to ensure your changes appear as expected

### Publishing

Documentation changes are automatically published to [alchemy.com/docs](https://alchemy.com/docs) when merged to the `main` branch.

## Technical Details

- The `scripts/insert-docs.sh` script handles:
  - Moving images to the correct location in the main docs site
  - Inserting Account Kit documentation configuration into the main docs site config
- Documentation is built and published using [Fern CLI](https://buildwithfern.com/learn/cli-reference/overview#setting-up-docs)

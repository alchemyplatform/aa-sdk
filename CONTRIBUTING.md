# Contributing

We welcome any and all contributions. To get started,

1. Make sure you have `yarn` installed. We are still using version 1.x. The installation instructions can be found here: https://classic.yarnpkg.com/lang/en/docs/install
2. [Fork](https://github.com/alchemyplatform/aa-sdk/fork) this repo
3. Run `yarn` to install dependencies
4. Make changes to packages

## Pull Request Checklist

- [ ] Did you add new tests and confirm existing tests pass? (`yarn test`)
- [ ] Did you update relevant docs? (docs are found in the `site` folder, see guidleines below)
- [ ] Do your commits follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard?
- [ ] Does your PR title also follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard?
- [ ] If you have a breaking change, is it [correctly reflected in your commit message](https://www.conventionalcommits.org/en/v1.0.0/#examples? (e.g. `feat!: breaking change`)
- [ ] Did you run lint (`yarn lint:check`) and fix any issues? (`yarn lint:fix`)
- [ ] Is the base branch you're merging into `development` and not `main`?

## Docs guidelines

We leverage `vitepress` to build our docs. You can find the docs in the `site` folder. To run the docs locally, run `yarn docs:dev` from the `site` folder. To build the docs, run `yarn docs:build`. Docs are automatically deployed with each package published.

When updating code, be sure to update the relevant doc within `site/packages/*`. The `packages` directory is broken down by the relevant package found within this repository. When adding new functionality, be sure to add a new doc outlining the method or class that you've added!

# Contributing

We're excited to have you contribute to the `aa-sdk`. Here's a step-by-step guide to help you get started.

## Getting Started

1. **Fork and Clone**: First, [fork the `aa-sdk` repository](https://github.com/alchemyplatform/aa-sdk/fork). Then, clone your forked repo to your local machine.

2. **Install Dependencies**: Ensure you have `yarn` installed (we use version 1.x). Installation instructions are available [here](https://classic.yarnpkg.com/lang/en/docs/install). Run `yarn` in the project root to install all necessary dependencies.

3. **Testing Environment**: Before making changes, make sure to verify the testing environment.

   - Use the Node version specified in `package.json` (currently 18.16.0). Run `node -v` to check your version.
   - Build the project with `yarn build`.
   - Run existing tests using `yarn test` to ensure everything is working correctly.

4. **Make Changes**: Now, you can start making changes to the packages or docs. When updating or adding new functionality, update or add a new doc in `site/packages/*` corresponding to the package you've worked on to document the changes.

5. **Re-verify Tests**: After making your changes, re-run `yarn test` to ensure all tests still pass.

6. **Code Formatting**:

   - Format your code changes with `yarn run lint:write`.
   - Confirm that your code passes format checks with `yarn run lint:check`.

7. **Docs Changes**:

   - We use `vitepress` for our docs located in the `site` folder.
   - To run docs locally: `yarn dev` from the `site` folder.
   - To build docs: `yarn build` from the `site` folder.
   - When editing or adding new docs, make sure you follow the guidelines mentioned below:
     - Follow the [Google style guidelines](https://developers.google.com/style) for docs content.
     - Additional Guidelines:
       - Use terms consistently (e.g., "smart account", not "Smart Account").
       - Refer to "Account Kit" correctly, without "the" or "AccountKit".
       - Use `LightAccount` for code references, "Light Account" in text.
       - Use "gasless" over "gas-less".
       - Write documentation in the [second person voice](https://developers.google.com/style/person).
       - Use "aa-sdk" or "Account Kit" depending on context, not "Account Kit SDK".
       - Capitalize "Gas Manager API" and "Bundler API".
       - Capitalize definitions for type primitives like `Provider`, `Signer`, `Account`.

8. **Committing Changes**: Commit your changes using a standardized message format.

   - Format: `[subject-type]: [description starting with lowercase letters] (#[issue number])`.
   - For breaking changes, clearly reflect in your commit message (e.g., `feat!: breaking change`).
   - Example: `feat: add sanity check on provider connect for clearer error message (#181)`.
   - Example: `docs: add new section on gasless transactions (#189)`.
   - Use `git log` to see more examples and acceptable subject-types.
   - For more details on semantic PR titles, refer to [Flank's guide on PR titles](https://flank.github.io/flank/pr_titles/).

9. **Creating a Pull Request**:

   - Push your changes to your GitHub fork.
   - Create a pull request against the original `aa-sdk` repository's `development` branch.
   - Ensure the pull request title follows the Enforce PR Title Format: `[subject-type]: [description starting with lowercase letters]`. You can check this using `echo "[YOUR_PR_TITLE_HERE] | yarn commitlint`.

10. **Celebrate** your contribution!

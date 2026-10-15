# Contributing

We are excited to have you contribute to the `aa-sdk`. Here's a step-by-step guide to help you get started.

## Getting started

1. **Fork and Clone**: First, [fork the `aa-sdk` repository](https://github.com/alchemyplatform/aa-sdk/fork). Then, clone your forked repo to your local machine.

2. **Set Up Environment Variables**: Create `.env` file in the root directory using the template `.env.example` and fill in the values with your Alchemy API key and Paymaster Policy ID where indicated.

3. **Install Dependencies**: Ensure you have `pnpm` installed. Installation instructions are available [here](https://pnpm.io/installation). Run `pnpm install` in the project root to install all necessary dependencies.

4. **Testing Environment**: Before making changes, make sure to verify the testing environment.

   - Use a Node version that satisfies the `package.json` engines requirement (currently `>=22.12.0`). Run `node -v` to check your version.
   - Use the pnpm version specified by `packageManager` in `package.json`.
   - Build the project with `pnpm run build:libs`.
   - Run existing tests using `pnpm run test:ci` and `pnpm run test:typecheck` to ensure everything is working correctly.

5. **Make Changes**: Now, you can start making changes to the packages or docs. When updating or adding new functionality, update the relevant package source, TSDoc, or docs in `docs/` so the change is documented.

6. **Re-verify Tests**: After making your changes, re-run `pnpm run test:ci` and `pnpm run test:typecheck` to ensure all tests still pass.

7. **Code Formatting**:

   - Format your code changes with `pnpm run lint:write`.
   - Confirm that your code passes format checks with `pnpm run lint:check`.

8. **Docs Changes**:

   - To build SDK docs: `pnpm run docs:sdk`.
   - To lint docs prose: `pnpm run lint:docs`.
   - To check docs links: `pnpm run docs:broken-links`.
   - When editing TypeDoc-generated SDK reference docs, update the source or TSDoc first, then run `pnpm run docs:sdk` and commit the generated `docs/pages/reference/` changes.

9. **Committing Changes**: Commit your changes using a standardized message format.

   - Format: `[subject-type]: [description starting with lowercase letters] (#[issue number])`.
   - For breaking changes, clearly reflect in your commit message (e.g., `feat!: breaking change`).
   - Example: `feat: add sanity check on provider connect for clearer error message (#181)`.
   - Example: `docs: add new section on gasless transactions (#189)`.
   - Use `git log` to see more examples and acceptable subject-types.
   - For more details on semantic PR titles, refer to [Flank's guide on PR titles](https://flank.github.io/flank/pr_titles/).

10. **Creating a Pull Request**:

- Push your changes to your GitHub fork.
- Create a pull request against the original `aa-sdk` repository's `main` branch.
- Ensure the pull request title follows the Enforce PR Title Format: `[subject-type]: [description starting with lowercase letters]`. You can check this using `echo "[YOUR_PR_TITLE_HERE] | pnpm commitlint`.

11. **Celebrate** your contribution!

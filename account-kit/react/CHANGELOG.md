# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.1) (2024-06-26)

### Bug Fixes

- lowercase strings in the UI components ([#784](https://github.com/alchemyplatform/aa-sdk/issues/784)) ([1bd922c](https://github.com/alchemyplatform/aa-sdk/commit/1bd922c68c005134b88e9b7a99aa3065dcea56f4))
- use updated package path in prettier config ([#741](https://github.com/alchemyplatform/aa-sdk/issues/741)) ([420b9ee](https://github.com/alchemyplatform/aa-sdk/commit/420b9ee1eb768f0b4124ee1f872fabc851ca35b9))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([9d81aaf](https://github.com/alchemyplatform/aa-sdk/commit/9d81aafe89b2dc49e2ab2c44556c81c3010c1fa2))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([c92a07f](https://github.com/alchemyplatform/aa-sdk/commit/c92a07fdb39d652fe5c95326d47a929b3b3278ed)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- add border radius to account kit theme config ([#781](https://github.com/alchemyplatform/aa-sdk/issues/781)) ([49d869c](https://github.com/alchemyplatform/aa-sdk/commit/49d869cb665dd508b6426c6efff9f1425bda113a))
- icon animations ([#717](https://github.com/alchemyplatform/aa-sdk/issues/717)) ([dab1237](https://github.com/alchemyplatform/aa-sdk/commit/dab1237feaf2d6e11c19f44720090dd830669866))
- new and improved auth modal ([#761](https://github.com/alchemyplatform/aa-sdk/issues/761)) ([2795e69](https://github.com/alchemyplatform/aa-sdk/commit/2795e6938006a853b737fa0404bc21883c416072))
- respect OS or root class for dark mode ([#759](https://github.com/alchemyplatform/aa-sdk/issues/759)) ([ecd5b01](https://github.com/alchemyplatform/aa-sdk/commit/ecd5b0187b1cba9c0f7a9a9777aebac580ad60e0))
- support different illustration styles ([#767](https://github.com/alchemyplatform/aa-sdk/issues/767)) ([278e478](https://github.com/alchemyplatform/aa-sdk/commit/278e478bd83aecabc8e74ef122d380a5ce0ef9d8))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([082d363](https://github.com/alchemyplatform/aa-sdk/commit/082d363923684ae3bc45edf544c8536ff3c42379))
- use brand accent color as icon colors ([#780](https://github.com/alchemyplatform/aa-sdk/issues/780)) ([10fd04d](https://github.com/alchemyplatform/aa-sdk/commit/10fd04d42e11817c67f8903c4ec277fc0163ac1c))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.0) (2024-06-19)

### Bug Fixes

- use updated package path in prettier config ([#741](https://github.com/alchemyplatform/aa-sdk/issues/741)) ([dccda3a](https://github.com/alchemyplatform/aa-sdk/commit/dccda3a738ceabe6ed2703cb66d0aec5e595abcd))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([d2f97c5](https://github.com/alchemyplatform/aa-sdk/commit/d2f97c56fdf63871296dd81b10cbc60b61b34d6c))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([6c41e22](https://github.com/alchemyplatform/aa-sdk/commit/6c41e22233932ee98c6214f2ffdf3e8f928f880f)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- icon animations ([#717](https://github.com/alchemyplatform/aa-sdk/issues/717)) ([710e647](https://github.com/alchemyplatform/aa-sdk/commit/710e64750c18b46390585e343ca4f1638feb67a5))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([c5465ee](https://github.com/alchemyplatform/aa-sdk/commit/c5465eee5c957afcb02d3e0d82c5821dd7819b5f))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

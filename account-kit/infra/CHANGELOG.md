# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.7...v4.0.0-alpha.8) (2024-07-22)

**Note:** Version bump only for package @account-kit/infra

# [4.0.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2024-07-19)

### Features

- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([62e2b59](https://github.com/alchemyplatform/aa-sdk/commit/62e2b59579e44f1825ae8224fb182aebd3c4f7e0))

# [4.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.6) (2024-07-18)

### Bug Fixes

- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([56af31e](https://github.com/alchemyplatform/aa-sdk/commit/56af31eb8580783d884a21d5b8d8d8a1420e1742))
- merge base into this ([ea9ce2c](https://github.com/alchemyplatform/aa-sdk/commit/ea9ce2cabc407eec69aebe459446630142108f06))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([3060a05](https://github.com/alchemyplatform/aa-sdk/commit/3060a05e895e6d6fef363276665f0d3d06c161fb))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([22b8183](https://github.com/alchemyplatform/aa-sdk/commit/22b8183ae297648d43594f59578163da6b0ae9bc)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

- refactor!: move chain definitions out of aa-sdk core (#772) ([ae8a272](https://github.com/alchemyplatform/aa-sdk/commit/ae8a2720818ff1505a2424fce5ce154b90b74fd0)), closes [#772](https://github.com/alchemyplatform/aa-sdk/issues/772)

### Features

- **aa-sdk/core:** add erc7677 middleware ([#823](https://github.com/alchemyplatform/aa-sdk/issues/823)) ([1a7af53](https://github.com/alchemyplatform/aa-sdk/commit/1a7af533d82e60accc3428cbb699f263a0cef536))
- **aa:** new chain ([#835](https://github.com/alchemyplatform/aa-sdk/issues/835)) ([79dbebf](https://github.com/alchemyplatform/aa-sdk/commit/79dbebf23416674f6e1c50fe5d29397e0d8bbf36))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([637bb95](https://github.com/alchemyplatform/aa-sdk/commit/637bb953d59bfd931652286dfc73497b0e0e288f))

### BREAKING CHANGES

- moves the chain definitions out of aa-sdk core and into account-kit/infra
- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.4...v4.0.0-alpha.5) (2024-07-11)

**Note:** Version bump only for package @account-kit/infra

# [4.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2024-07-10)

**Note:** Version bump only for package @account-kit/infra

# [4.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2024-07-09)

### Bug Fixes

- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([2adddf9](https://github.com/alchemyplatform/aa-sdk/commit/2adddf93775370498cd60e21fccb21f03aa29544))

# [4.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.2) (2024-07-08)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([0601453](https://github.com/alchemyplatform/aa-sdk/commit/060145386572026905f5720866722c5a20c9d7db))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([b2b7cc6](https://github.com/alchemyplatform/aa-sdk/commit/b2b7cc680860f3d416d11b66d626e715fae4cf8b)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

- refactor!: move chain definitions out of aa-sdk core (#772) ([dae2ad0](https://github.com/alchemyplatform/aa-sdk/commit/dae2ad08d863f9d25508e475903e042190aad56f)), closes [#772](https://github.com/alchemyplatform/aa-sdk/issues/772)

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([4c0b2f1](https://github.com/alchemyplatform/aa-sdk/commit/4c0b2f19a59272940b3fe40c610c06ad8c49d70e))

### BREAKING CHANGES

- moves the chain definitions out of aa-sdk core and into account-kit/infra
- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.1) (2024-06-26)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([9d81aaf](https://github.com/alchemyplatform/aa-sdk/commit/9d81aafe89b2dc49e2ab2c44556c81c3010c1fa2))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([c92a07f](https://github.com/alchemyplatform/aa-sdk/commit/c92a07fdb39d652fe5c95326d47a929b3b3278ed)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([082d363](https://github.com/alchemyplatform/aa-sdk/commit/082d363923684ae3bc45edf544c8536ff3c42379))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.0) (2024-06-19)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([d2f97c5](https://github.com/alchemyplatform/aa-sdk/commit/d2f97c56fdf63871296dd81b10cbc60b61b34d6c))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([6c41e22](https://github.com/alchemyplatform/aa-sdk/commit/6c41e22233932ee98c6214f2ffdf3e8f928f880f)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([c5465ee](https://github.com/alchemyplatform/aa-sdk/commit/c5465eee5c957afcb02d3e0d82c5821dd7819b5f))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

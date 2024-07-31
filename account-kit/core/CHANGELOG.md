# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.9) (2024-07-31)

### Bug Fixes

- **core:** initial state parsing and disconnect logic ([#842](https://github.com/alchemyplatform/aa-sdk/issues/842)) ([1f1047b](https://github.com/alchemyplatform/aa-sdk/commit/1f1047b4201c976fa8abaed76f8949163afb085b))
- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([190e25f](https://github.com/alchemyplatform/aa-sdk/commit/190e25f55e30c8555863601f471e24f0a5122926))
- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([0dd262e](https://github.com/alchemyplatform/aa-sdk/commit/0dd262e06e9fafffdb7af36cf36a952045d6a6ad))
- merge base into this ([1409772](https://github.com/alchemyplatform/aa-sdk/commit/140977220c6e9cd32820a64e573c2d8070e9b603))
- passing gas manager to createConfig should use it ([#836](https://github.com/alchemyplatform/aa-sdk/issues/836)) ([b8fce22](https://github.com/alchemyplatform/aa-sdk/commit/b8fce22a281d700f502f2063fb016726c6d34d6b))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([8ef751e](https://github.com/alchemyplatform/aa-sdk/commit/8ef751eab7a2357caaa6d5d63cbc1907e90c39cb))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([9cf1b77](https://github.com/alchemyplatform/aa-sdk/commit/9cf1b77e2ac738996af258e38879173184805a1c)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- clean up UI state on log out ([#832](https://github.com/alchemyplatform/aa-sdk/issues/832)) ([cffda84](https://github.com/alchemyplatform/aa-sdk/commit/cffda8493deaf7cb29d4f93d40aa88cd63eb5b75))
- enable linting class methods from exported classes ([2ee9eb9](https://github.com/alchemyplatform/aa-sdk/commit/2ee9eb979e1c079ae68a76e9156d6e143c0ce909))
- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([0020257](https://github.com/alchemyplatform/aa-sdk/commit/002025791b57b6aa3f5efd9858593ccb25918d97))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([c550465](https://github.com/alchemyplatform/aa-sdk/commit/c55046525d790001db4a9a305cade6f0d06ca90b))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.7...v4.0.0-alpha.8) (2024-07-22)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2024-07-19)

### Bug Fixes

- **core:** initial state parsing and disconnect logic ([#842](https://github.com/alchemyplatform/aa-sdk/issues/842)) ([2db4965](https://github.com/alchemyplatform/aa-sdk/commit/2db49655b3b9c5bf2bb434e516f743ddbdd5a3b4))

### Features

- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([62e2b59](https://github.com/alchemyplatform/aa-sdk/commit/62e2b59579e44f1825ae8224fb182aebd3c4f7e0))

# [4.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.6) (2024-07-18)

### Bug Fixes

- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([56af31e](https://github.com/alchemyplatform/aa-sdk/commit/56af31eb8580783d884a21d5b8d8d8a1420e1742))
- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([90af8cd](https://github.com/alchemyplatform/aa-sdk/commit/90af8cd211544f3f20c749d6ac144c668376c65c))
- merge base into this ([ea9ce2c](https://github.com/alchemyplatform/aa-sdk/commit/ea9ce2cabc407eec69aebe459446630142108f06))
- passing gas manager to createConfig should use it ([#836](https://github.com/alchemyplatform/aa-sdk/issues/836)) ([86e6116](https://github.com/alchemyplatform/aa-sdk/commit/86e611609ccdc780d9f3c63f1b8317f057ad2f4d))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([3060a05](https://github.com/alchemyplatform/aa-sdk/commit/3060a05e895e6d6fef363276665f0d3d06c161fb))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([22b8183](https://github.com/alchemyplatform/aa-sdk/commit/22b8183ae297648d43594f59578163da6b0ae9bc)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- clean up UI state on log out ([#832](https://github.com/alchemyplatform/aa-sdk/issues/832)) ([eb87340](https://github.com/alchemyplatform/aa-sdk/commit/eb8734031b0b8132b7d1e7d19f7b57dfeda920c3))
- enable linting class methods from exported classes ([20df68e](https://github.com/alchemyplatform/aa-sdk/commit/20df68ecc722ee4c87b75f1880debe4591be5bb5))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([637bb95](https://github.com/alchemyplatform/aa-sdk/commit/637bb953d59bfd931652286dfc73497b0e0e288f))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.4...v4.0.0-alpha.5) (2024-07-11)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2024-07-10)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2024-07-09)

### Bug Fixes

- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([2adddf9](https://github.com/alchemyplatform/aa-sdk/commit/2adddf93775370498cd60e21fccb21f03aa29544))

# [4.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.2) (2024-07-08)

### Bug Fixes

- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([e845341](https://github.com/alchemyplatform/aa-sdk/commit/e8453410547d5dff492c3f44f898029cc0853eb8))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([0601453](https://github.com/alchemyplatform/aa-sdk/commit/060145386572026905f5720866722c5a20c9d7db))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([b2b7cc6](https://github.com/alchemyplatform/aa-sdk/commit/b2b7cc680860f3d416d11b66d626e715fae4cf8b)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([4c0b2f1](https://github.com/alchemyplatform/aa-sdk/commit/4c0b2f19a59272940b3fe40c610c06ad8c49d70e))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.1) (2024-06-26)

### Bug Fixes

- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([b2c229c](https://github.com/alchemyplatform/aa-sdk/commit/b2c229c145b30c42b97a244a94b3b4fc605f93cf))

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

### Bug Fixes

- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([6afff79](https://github.com/alchemyplatform/aa-sdk/commit/6afff7976153a5bf07187fc0506eec65bbe4c6e4))

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

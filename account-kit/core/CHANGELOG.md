# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.1...v4.1.0) (2024-10-23)

**Note:** Version bump only for package @account-kit/core

## [4.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0...v4.0.1) (2024-10-19)

### Bug Fixes

- issue causing recursive depth exception in react ([#1088](https://github.com/alchemyplatform/aa-sdk/issues/1088)) ([7b61fd6](https://github.com/alchemyplatform/aa-sdk/commit/7b61fd664daa256578c092e8feef6e4b1f25931d))

# [4.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.10...v4.0.0) (2024-10-15)

### Bug Fixes

- drop id token and claims from user object for now ([#1070](https://github.com/alchemyplatform/aa-sdk/issues/1070)) ([b45fa9f](https://github.com/alchemyplatform/aa-sdk/commit/b45fa9f844589284f8d46849e0265d04ca1f0b61))

# [4.0.0-beta.10](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2024-10-15)

### Bug Fixes

- **core:** hydrate wasn't properly handling logged out users ([#1046](https://github.com/alchemyplatform/aa-sdk/issues/1046)) ([987cf88](https://github.com/alchemyplatform/aa-sdk/commit/987cf88bc4cba351663fe3b04dcc12cc39ae93b4))

### Features

- add google auth components and demo support (extension of linnas pr) ([#1032](https://github.com/alchemyplatform/aa-sdk/issues/1032)) ([cb91914](https://github.com/alchemyplatform/aa-sdk/commit/cb91914c8da0a7c3e7519bf98bc55d2848062e9f)), closes [#1024](https://github.com/alchemyplatform/aa-sdk/issues/1024) [#1035](https://github.com/alchemyplatform/aa-sdk/issues/1035) [#1036](https://github.com/alchemyplatform/aa-sdk/issues/1036)
- add logger schemas to infra, react, core ([65fac7d](https://github.com/alchemyplatform/aa-sdk/commit/65fac7dbf2c63232199607b801db49ee96294b41))
- **demo:** persist the demo config across refreshes ([#1040](https://github.com/alchemyplatform/aa-sdk/issues/1040)) ([8ce8c36](https://github.com/alchemyplatform/aa-sdk/commit/8ce8c360676d7c2496ef86017f5c24b2d8671341))
- log events from core package ([eab0ecd](https://github.com/alchemyplatform/aa-sdk/commit/eab0ecd7079b303bef15decca13f8ffac6eccea3))

# [4.0.0-beta.9](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2024-10-09)

### Bug Fixes

- persist login state across refreshes ([#1020](https://github.com/alchemyplatform/aa-sdk/issues/1020)) ([73214a0](https://github.com/alchemyplatform/aa-sdk/commit/73214a08e530197338375ecba85d7a683c6c0041))

### Features

- enable specifying the domain that a session is available on (if storage supports it) ([#1022](https://github.com/alchemyplatform/aa-sdk/issues/1022)) ([90d859c](https://github.com/alchemyplatform/aa-sdk/commit/90d859cbcb6e9d9e2ff69794cced6da9a08697c4))
- expose signer error messages ([#1019](https://github.com/alchemyplatform/aa-sdk/issues/1019)) ([998c75c](https://github.com/alchemyplatform/aa-sdk/commit/998c75c61fcd67741bb8d4e25221423441cdd1d6))

# [4.0.0-beta.8](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2024-10-02)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-beta.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2024-09-27)

### Bug Fixes

- **ui-components:** ensure the passkey prompt always shows up when qp is present ([#978](https://github.com/alchemyplatform/aa-sdk/issues/978)) ([81f1580](https://github.com/alchemyplatform/aa-sdk/commit/81f15806e704bcffca6435eccb293923ff64d0e9))

# [4.0.0-beta.6](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2024-09-18)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-beta.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2024-09-18)

### Bug Fixes

- don't ignore oauthCallbackUrl config option ([#971](https://github.com/alchemyplatform/aa-sdk/issues/971)) ([714da46](https://github.com/alchemyplatform/aa-sdk/commit/714da4652f1b55a763d77cc5a509c04054aab384))

# [4.0.0-beta.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2024-09-18)

### Features

- add support for social login ([#942](https://github.com/alchemyplatform/aa-sdk/issues/942)) ([aa00dc7](https://github.com/alchemyplatform/aa-sdk/commit/aa00dc7d880f6d9cf9ae29e63941a9552faa9dd5))

# [4.0.0-beta.3](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.0...v4.0.0-beta.3) (2024-09-16)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-beta.2](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2024-09-06)

### Bug Fixes

- update store logic on merging and disconnect ([#948](https://github.com/alchemyplatform/aa-sdk/issues/948)) ([1ef808b](https://github.com/alchemyplatform/aa-sdk/commit/1ef808b247ca283b7528306620f4d1200c7c5d5f))

# [4.0.0-beta.1](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2024-09-04)

**Note:** Version bump only for package @account-kit/core

# [4.0.0-beta.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.19.0...v4.0.0-beta.0) (2024-08-28)

### Bug Fixes

- **core:** initial state parsing and disconnect logic ([#842](https://github.com/alchemyplatform/aa-sdk/issues/842)) ([d3e80ad](https://github.com/alchemyplatform/aa-sdk/commit/d3e80ad7ad8f3469a40bc741595719c57374e8b9))
- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([0d094e8](https://github.com/alchemyplatform/aa-sdk/commit/0d094e870c1a0ceb5f8d1c862f4109e32de46097))
- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([2bbf359](https://github.com/alchemyplatform/aa-sdk/commit/2bbf3598a882089ad78c36622cb73607d3737f91))
- merge base into this ([e41b396](https://github.com/alchemyplatform/aa-sdk/commit/e41b396fdf331d2dd7d4e6b608b90dcab37f8386))
- passing gas manager to createConfig should use it ([#836](https://github.com/alchemyplatform/aa-sdk/issues/836)) ([53b4e95](https://github.com/alchemyplatform/aa-sdk/commit/53b4e950c4aa153ba7c26d98acc2898591931cb9))
- **ui-modal:** don't render ui modal if no ui config is passed in ([#943](https://github.com/alchemyplatform/aa-sdk/issues/943)) ([65b1584](https://github.com/alchemyplatform/aa-sdk/commit/65b1584c6f3bf5226bcf457d3736bda3543d6219))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([02f2f16](https://github.com/alchemyplatform/aa-sdk/commit/02f2f1623803480b8dc496491d2232c6fe5c219c))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([55e6632](https://github.com/alchemyplatform/aa-sdk/commit/55e663208aae63e6092cbf2335c58f1448bd0dc3)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- clean up UI state on log out ([#832](https://github.com/alchemyplatform/aa-sdk/issues/832)) ([85548c8](https://github.com/alchemyplatform/aa-sdk/commit/85548c86fe52262bfc761a5b3c0eb5d050bd8568))
- enable linting class methods from exported classes ([1b87a51](https://github.com/alchemyplatform/aa-sdk/commit/1b87a51f5cafada625180b386e9b7e4e58f6e4d7))
- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([4be87d3](https://github.com/alchemyplatform/aa-sdk/commit/4be87d3147e1cdd70d2034479dcf0973c2820ea8))
- make it easier to start with account-kit/core ([#933](https://github.com/alchemyplatform/aa-sdk/issues/933)) ([6d98643](https://github.com/alchemyplatform/aa-sdk/commit/6d9864334f3c8e98ddb2f5885dbc705dc78587ba))
- **react:** enable multi-owner la usage in core and react ([#893](https://github.com/alchemyplatform/aa-sdk/issues/893)) ([43464da](https://github.com/alchemyplatform/aa-sdk/commit/43464daf59e6b653a5332662c4098cb2174f65d3))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([593e84c](https://github.com/alchemyplatform/aa-sdk/commit/593e84c027a697b757e3fd954564ff40cd1e11b0))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.12](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.11...v4.0.0-alpha.12) (2024-08-20)

### Features

- make it easier to start with account-kit/core ([#933](https://github.com/alchemyplatform/aa-sdk/issues/933)) ([b5714b6](https://github.com/alchemyplatform/aa-sdk/commit/b5714b6be15a4d7cb41c45911ca3cb42482aa85f))

# [4.0.0-alpha.11](https://github.com/alchemyplatform/aa-sdk/compare/v3.19.0...v4.0.0-alpha.11) (2024-08-16)

### Bug Fixes

- **core:** initial state parsing and disconnect logic ([#842](https://github.com/alchemyplatform/aa-sdk/issues/842)) ([373ad81](https://github.com/alchemyplatform/aa-sdk/commit/373ad81b099fd2a75a8b6207b754c1b6d8fe521e))
- **core:** the reconnect method was causing an infinite loop ([#808](https://github.com/alchemyplatform/aa-sdk/issues/808)) ([0d09472](https://github.com/alchemyplatform/aa-sdk/commit/0d09472d5cf4a32864272a4f524d630f50a4a1ab))
- demo app not building ([#733](https://github.com/alchemyplatform/aa-sdk/issues/733)) ([9f77a54](https://github.com/alchemyplatform/aa-sdk/commit/9f77a54777d0e355331fdfa14e235af781f25750))
- merge base into this ([f9a6b2d](https://github.com/alchemyplatform/aa-sdk/commit/f9a6b2d801b909146c0e10bb072369992163ea69))
- passing gas manager to createConfig should use it ([#836](https://github.com/alchemyplatform/aa-sdk/issues/836)) ([f2c9723](https://github.com/alchemyplatform/aa-sdk/commit/f2c972303906ecd977fae891c688eedef81e5420))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([b643981](https://github.com/alchemyplatform/aa-sdk/commit/b643981e900d9cabf6e273b5f7e9e75cd0c32c7d))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([9cb9d92](https://github.com/alchemyplatform/aa-sdk/commit/9cb9d9283db899d5a2f632767993c04135eb1de8)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- clean up UI state on log out ([#832](https://github.com/alchemyplatform/aa-sdk/issues/832)) ([0a5a4ae](https://github.com/alchemyplatform/aa-sdk/commit/0a5a4ae7cc6914b05d471d010a161c7a8a8f303b))
- enable linting class methods from exported classes ([4968d83](https://github.com/alchemyplatform/aa-sdk/commit/4968d838e903218d255bff0610babebd37c13413))
- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([4e645e9](https://github.com/alchemyplatform/aa-sdk/commit/4e645e97a745bfdd11d6174cb32c7f2eb556f803))
- **react:** enable multi-owner la usage in core and react ([#893](https://github.com/alchemyplatform/aa-sdk/issues/893)) ([6d1bfc5](https://github.com/alchemyplatform/aa-sdk/commit/6d1bfc5ffde1a9ba814c06983939994ccceaa9f6))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([45582b1](https://github.com/alchemyplatform/aa-sdk/commit/45582b14e7116903f9b91cdd4bf2bb04de14ffa4))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.9...v4.0.0-alpha.10) (2024-08-01)

**Note:** Version bump only for package @account-kit/core

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

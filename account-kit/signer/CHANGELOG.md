# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.1...v4.1.0) (2024-10-23)

**Note:** Version bump only for package @account-kit/signer

## [4.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0...v4.0.1) (2024-10-19)

### Bug Fixes

- don't re-initialize unless the user has changed ([#1095](https://github.com/alchemyplatform/aa-sdk/issues/1095)) ([c7768a8](https://github.com/alchemyplatform/aa-sdk/commit/c7768a831b2c9f8e07d36ba940ad81199e4f617c))

# [4.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.10...v4.0.0) (2024-10-15)

### Bug Fixes

- passkey causes stuck loading state ([#1065](https://github.com/alchemyplatform/aa-sdk/issues/1065)) ([984f34c](https://github.com/alchemyplatform/aa-sdk/commit/984f34ce59ae3edc8f51a8f6a1a10199eaf17987))

# [4.0.0-beta.10](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2024-10-15)

### Bug Fixes

- set error state when authentication fails ([#1038](https://github.com/alchemyplatform/aa-sdk/issues/1038)) ([dfb91d2](https://github.com/alchemyplatform/aa-sdk/commit/dfb91d20924a12d14bb80348b1361d3871f96dfd))

### Features

- add google auth components and demo support (extension of linnas pr) ([#1032](https://github.com/alchemyplatform/aa-sdk/issues/1032)) ([cb91914](https://github.com/alchemyplatform/aa-sdk/commit/cb91914c8da0a7c3e7519bf98bc55d2848062e9f)), closes [#1024](https://github.com/alchemyplatform/aa-sdk/issues/1024) [#1035](https://github.com/alchemyplatform/aa-sdk/issues/1035) [#1036](https://github.com/alchemyplatform/aa-sdk/issues/1036)
- add signer profiling metrics ([b7b0aa3](https://github.com/alchemyplatform/aa-sdk/commit/b7b0aa371e124548c2f2e7693f68e474648ae6c5))
- log events from signer package ([421d273](https://github.com/alchemyplatform/aa-sdk/commit/421d273240fbbaa8a07303da473e651332577b2e))

# [4.0.0-beta.9](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2024-10-09)

### Bug Fixes

- allow users to log back in after logout ([#1023](https://github.com/alchemyplatform/aa-sdk/issues/1023)) ([0ff156b](https://github.com/alchemyplatform/aa-sdk/commit/0ff156b172eedc0337f3649c0a4b4c41c3834ca8))

### Features

- expose signer error messages ([#1019](https://github.com/alchemyplatform/aa-sdk/issues/1019)) ([998c75c](https://github.com/alchemyplatform/aa-sdk/commit/998c75c61fcd67741bb8d4e25221423441cdd1d6))
- return id token and claims on user ([#1031](https://github.com/alchemyplatform/aa-sdk/issues/1031)) ([b6e9ccc](https://github.com/alchemyplatform/aa-sdk/commit/b6e9ccc975f8c75ecfb09140cb755fe43ae41e51))

# [4.0.0-beta.8](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2024-10-02)

### Bug Fixes

- ensure openid is included in custom scopes ([#992](https://github.com/alchemyplatform/aa-sdk/issues/992)) ([2492e47](https://github.com/alchemyplatform/aa-sdk/commit/2492e4734ec9eed63624eed15cbc3b50f04faa55))

# [4.0.0-beta.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2024-09-27)

### Bug Fixes

- close OAuth popup from parent ([#973](https://github.com/alchemyplatform/aa-sdk/issues/973)) ([b67844c](https://github.com/alchemyplatform/aa-sdk/commit/b67844cc7e58eec8de00dd4504a8265a588ca2b6))
- **ui-components:** ensure the passkey prompt always shows up when qp is present ([#978](https://github.com/alchemyplatform/aa-sdk/issues/978)) ([81f1580](https://github.com/alchemyplatform/aa-sdk/commit/81f15806e704bcffca6435eccb293923ff64d0e9))

### Features

- add auth0connection param ([#981](https://github.com/alchemyplatform/aa-sdk/issues/981)) ([4fc80e4](https://github.com/alchemyplatform/aa-sdk/commit/4fc80e4e0c675dec51262a761e35d96a30ad100d))
- improve OAuth error handling ([#982](https://github.com/alchemyplatform/aa-sdk/issues/982)) ([66e85d6](https://github.com/alchemyplatform/aa-sdk/commit/66e85d620e295eae2644cba03ac1f0a9bcc15941))

# [4.0.0-beta.6](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2024-09-18)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-beta.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2024-09-18)

### Bug Fixes

- don't ignore oauthCallbackUrl config option ([#971](https://github.com/alchemyplatform/aa-sdk/issues/971)) ([714da46](https://github.com/alchemyplatform/aa-sdk/commit/714da4652f1b55a763d77cc5a509c04054aab384))

# [4.0.0-beta.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2024-09-18)

### Features

- add support for social login ([#942](https://github.com/alchemyplatform/aa-sdk/issues/942)) ([aa00dc7](https://github.com/alchemyplatform/aa-sdk/commit/aa00dc7d880f6d9cf9ae29e63941a9552faa9dd5))

# [4.0.0-beta.3](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.0...v4.0.0-beta.3) (2024-09-16)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-beta.2](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2024-09-06)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-beta.1](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2024-09-04)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-beta.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.19.0...v4.0.0-beta.0) (2024-08-28)

### Bug Fixes

- merge base into this ([e41b396](https://github.com/alchemyplatform/aa-sdk/commit/e41b396fdf331d2dd7d4e6b608b90dcab37f8386))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([02f2f16](https://github.com/alchemyplatform/aa-sdk/commit/02f2f1623803480b8dc496491d2232c6fe5c219c))

### Features

- add doc generator for class methods ([#806](https://github.com/alchemyplatform/aa-sdk/issues/806)) ([a389f65](https://github.com/alchemyplatform/aa-sdk/commit/a389f656a6e4feb14e13ecfc84880e4e0d93d786))
- allow for passkey + email signup ([#920](https://github.com/alchemyplatform/aa-sdk/issues/920)) ([651a60e](https://github.com/alchemyplatform/aa-sdk/commit/651a60eeafcd3a42dc8ab3e44d5283f52a572ba1))
- enable linting class methods from exported classes ([1b87a51](https://github.com/alchemyplatform/aa-sdk/commit/1b87a51f5cafada625180b386e9b7e4e58f6e4d7))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([593e84c](https://github.com/alchemyplatform/aa-sdk/commit/593e84c027a697b757e3fd954564ff40cd1e11b0))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.12](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.11...v4.0.0-alpha.12) (2024-08-20)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.11](https://github.com/alchemyplatform/aa-sdk/compare/v3.19.0...v4.0.0-alpha.11) (2024-08-16)

### Bug Fixes

- merge base into this ([f9a6b2d](https://github.com/alchemyplatform/aa-sdk/commit/f9a6b2d801b909146c0e10bb072369992163ea69))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([b643981](https://github.com/alchemyplatform/aa-sdk/commit/b643981e900d9cabf6e273b5f7e9e75cd0c32c7d))

### Features

- add doc generator for class methods ([#806](https://github.com/alchemyplatform/aa-sdk/issues/806)) ([3cdea84](https://github.com/alchemyplatform/aa-sdk/commit/3cdea8457d0a1fabd63d6d318a7bd1f62883d5b4))
- allow for passkey + email signup ([#920](https://github.com/alchemyplatform/aa-sdk/issues/920)) ([b196439](https://github.com/alchemyplatform/aa-sdk/commit/b1964397bbfb722bcd306f07a0a3e343af89d1e1))
- enable linting class methods from exported classes ([4968d83](https://github.com/alchemyplatform/aa-sdk/commit/4968d838e903218d255bff0610babebd37c13413))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([45582b1](https://github.com/alchemyplatform/aa-sdk/commit/45582b14e7116903f9b91cdd4bf2bb04de14ffa4))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.9...v4.0.0-alpha.10) (2024-08-01)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.9) (2024-07-31)

### Bug Fixes

- merge base into this ([1409772](https://github.com/alchemyplatform/aa-sdk/commit/140977220c6e9cd32820a64e573c2d8070e9b603))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([8ef751e](https://github.com/alchemyplatform/aa-sdk/commit/8ef751eab7a2357caaa6d5d63cbc1907e90c39cb))

### Features

- add doc generator for class methods ([#806](https://github.com/alchemyplatform/aa-sdk/issues/806)) ([e177533](https://github.com/alchemyplatform/aa-sdk/commit/e17753377757b4e75f289224fe7e1c4575875286))
- enable linting class methods from exported classes ([2ee9eb9](https://github.com/alchemyplatform/aa-sdk/commit/2ee9eb979e1c079ae68a76e9156d6e143c0ce909))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([c550465](https://github.com/alchemyplatform/aa-sdk/commit/c55046525d790001db4a9a305cade6f0d06ca90b))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.7...v4.0.0-alpha.8) (2024-07-22)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2024-07-19)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.6) (2024-07-18)

### Bug Fixes

- merge base into this ([ea9ce2c](https://github.com/alchemyplatform/aa-sdk/commit/ea9ce2cabc407eec69aebe459446630142108f06))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([3060a05](https://github.com/alchemyplatform/aa-sdk/commit/3060a05e895e6d6fef363276665f0d3d06c161fb))

### Features

- add doc generator for class methods ([#806](https://github.com/alchemyplatform/aa-sdk/issues/806)) ([4102ae0](https://github.com/alchemyplatform/aa-sdk/commit/4102ae051a5a8ac03fb88f08adc8b3bca0f9737e))
- enable linting class methods from exported classes ([20df68e](https://github.com/alchemyplatform/aa-sdk/commit/20df68ecc722ee4c87b75f1880debe4591be5bb5))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([637bb95](https://github.com/alchemyplatform/aa-sdk/commit/637bb953d59bfd931652286dfc73497b0e0e288f))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.4...v4.0.0-alpha.5) (2024-07-11)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2024-07-10)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2024-07-09)

**Note:** Version bump only for package @account-kit/signer

# [4.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.2) (2024-07-08)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([0601453](https://github.com/alchemyplatform/aa-sdk/commit/060145386572026905f5720866722c5a20c9d7db))

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([4c0b2f1](https://github.com/alchemyplatform/aa-sdk/commit/4c0b2f19a59272940b3fe40c610c06ad8c49d70e))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.1) (2024-06-26)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([9d81aaf](https://github.com/alchemyplatform/aa-sdk/commit/9d81aafe89b2dc49e2ab2c44556c81c3010c1fa2))

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([082d363](https://github.com/alchemyplatform/aa-sdk/commit/082d363923684ae3bc45edf544c8536ff3c42379))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

# [4.0.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.0) (2024-06-19)

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([d2f97c5](https://github.com/alchemyplatform/aa-sdk/commit/d2f97c56fdf63871296dd81b10cbc60b61b34d6c))

### Features

- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([c5465ee](https://github.com/alchemyplatform/aa-sdk/commit/c5465eee5c957afcb02d3e0d82c5821dd7819b5f))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_

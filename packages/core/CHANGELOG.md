# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.32...v0.1.0) (2023-10-10)

### Bug Fixes

- interface ISmartAccountProvider annotation ([#119](https://github.com/alchemyplatform/aa-sdk/issues/119)) ([603ef4e](https://github.com/alchemyplatform/aa-sdk/commit/603ef4ee9f3eae9ffd9dc798ae934f257ecfe409))

### Features

- merge in all of the staged changes to the aa-sdk ([#120](https://github.com/alchemyplatform/aa-sdk/issues/120)) ([7a9effa](https://github.com/alchemyplatform/aa-sdk/commit/7a9effaa07c03a6a50c9cf856b5935e735adae3a)), closes [#1](https://github.com/alchemyplatform/aa-sdk/issues/1) [#2](https://github.com/alchemyplatform/aa-sdk/issues/2) [#3](https://github.com/alchemyplatform/aa-sdk/issues/3) [#7](https://github.com/alchemyplatform/aa-sdk/issues/7) [#8](https://github.com/alchemyplatform/aa-sdk/issues/8) [#9](https://github.com/alchemyplatform/aa-sdk/issues/9)

# 0.1.0-alpha.32 (2023-09-18)

### Bug Fixes

- `baseGoerli` chainId in `chains.ts` ([#104](https://github.com/alchemyplatform/aa-sdk/issues/104)) ([2dda5dd](https://github.com/alchemyplatform/aa-sdk/commit/2dda5dd729124338ddf529c11bbf24afaea05dd4))

# 0.1.0-alpha.31 (2023-09-13)

### Bug Fixes

- remove all references to `SimpleSmartAccountOwner` ([#101](https://github.com/alchemyplatform/aa-sdk/issues/101)) ([a8f101d](https://github.com/alchemyplatform/aa-sdk/commit/a8f101dff7fbbd10598467ddaaa1c3c55f707e6d))

# 0.1.0-alpha.30 (2023-09-11)

### Features

- add base support to alchemy provider ([#100](https://github.com/alchemyplatform/aa-sdk/issues/100)) ([a5dc65c](https://github.com/alchemyplatform/aa-sdk/commit/a5dc65c4208614b935943ebdd8eececf3de03d29))

# 0.1.0-alpha.29 (2023-08-29)

### Bug Fixes

- **core:** add missing `null` return type of `eth_getUserOperation*` ([#93](https://github.com/alchemyplatform/aa-sdk/issues/93)) ([cba9a0c](https://github.com/alchemyplatform/aa-sdk/commit/cba9a0c79807612b37c9d8c300b494312c9bd752))

# 0.1.0-alpha.28 (2023-08-25)

### Bug Fixes

- pass overrides from tx to user op ([#88](https://github.com/alchemyplatform/aa-sdk/issues/88)) ([985cb99](https://github.com/alchemyplatform/aa-sdk/commit/985cb997691f5b251337ea0fbe6bd23e6b3fb455))

# 0.1.0-alpha.27 (2023-08-24)

**Note:** Version bump only for package @alchemy/aa-core

# 0.1.0-alpha.26 (2023-08-23)

### Features

- add utils for getting the intermediary UO struct ([#86](https://github.com/alchemyplatform/aa-sdk/issues/86)) ([0e1a701](https://github.com/alchemyplatform/aa-sdk/commit/0e1a70174c0eeff2eedce4379914cad75f0629b2))

# 0.1.0-alpha.25 (2023-08-17)

### Features

- add jwt support for Alchemy providers ([#81](https://github.com/alchemyplatform/aa-sdk/issues/81)) ([af85aa4](https://github.com/alchemyplatform/aa-sdk/commit/af85aa41441825ca6545e850cbc7e834879cf236))

# 0.1.0-alpha.24 (2023-08-16)

### Features

- add utils for verifying 6492 sigs and ensip-11 utils ([#80](https://github.com/alchemyplatform/aa-sdk/issues/80)) ([52231b6](https://github.com/alchemyplatform/aa-sdk/commit/52231b6b4a521ee0713c4d3d3126ac4e5d66f14c))

# 0.1.0-alpha.23 (2023-08-14)

### Features

- **alchemy:** modify fee defaults ([0a0a65c](https://github.com/alchemyplatform/aa-sdk/commit/0a0a65c03a6991a1c57473ae9e65c4b727d937e2))

# 0.1.0-alpha.22 (2023-08-11)

**Note:** Version bump only for package @alchemy/aa-core

# 0.1.0-alpha.21 (2023-08-08)

### Features

- allow overriding alchemy provider rpc url ([#70](https://github.com/alchemyplatform/aa-sdk/issues/70)) ([6b7c4b9](https://github.com/alchemyplatform/aa-sdk/commit/6b7c4b911b97dfcd1cfb00b2892548644fbe2fc6))

# 0.1.0-alpha.20 (2023-08-05)

### Features

- add signTypedData to providers ([#66](https://github.com/alchemyplatform/aa-sdk/issues/66)) ([e0a99f6](https://github.com/alchemyplatform/aa-sdk/commit/e0a99f694a6ed6e88b15d6cc73f99e74fd985667))

# 0.1.0-alpha.19 (2023-08-03)

### Features

- add event emitter to the provider so that we can listen to connected events in dapps ([#65](https://github.com/alchemyplatform/aa-sdk/issues/65)) ([35ee990](https://github.com/alchemyplatform/aa-sdk/commit/35ee990afa1c8be7c4685631af6654ac51b094cd))

# 0.1.0-alpha.18 (2023-07-28)

**Note:** Version bump only for package @alchemy/aa-core

# 0.1.0-alpha.17 (2023-07-19)

### Features

- add support for fetch options when creating public clients ([#59](https://github.com/alchemyplatform/aa-sdk/issues/59)) ([5028e7b](https://github.com/alchemyplatform/aa-sdk/commit/5028e7b21a208ad8f88e81d455c2c8e24d57d953))

# 0.1.0-alpha.16 (2023-07-06)

### Bug Fixes

- always import with file extension ([#48](https://github.com/alchemyplatform/aa-sdk/issues/48)) ([4776d74](https://github.com/alchemyplatform/aa-sdk/commit/4776d7476f8cb622416c8846afa9bc17d16b97a6))

# 0.1.0-alpha.15 (2023-07-05)

### Features

- kernel batch transactions and gas estimation fixes ([#39](https://github.com/alchemyplatform/aa-sdk/issues/39)) ([f2a3d3d](https://github.com/alchemyplatform/aa-sdk/commit/f2a3d3d093ddbe1b564c0242c28b67487554f1ba))

# 0.1.0-alpha.14 (2023-06-29)

### Bug Fixes

- npm 404 error ([f34f581](https://github.com/alchemyplatform/aa-sdk/commit/f34f581a0399a2e30f33161d8b4cc1d778122b1f))

# 0.1.0-alpha.13 (2023-06-29)

### Bug Fixes

- add github user details to publish script ([2b812d3](https://github.com/alchemyplatform/aa-sdk/commit/2b812d34c041e11ba7d4c11a72c26da8f8e7af21))

# [0.1.0-alpha.11](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.10...v0.1.0-alpha.11) (2023-06-26)

### Features

- add a logger and some debug statements ([#35](https://github.com/alchemyplatform/aa-sdk/issues/35)) ([faef24e](https://github.com/alchemyplatform/aa-sdk/commit/faef24e9060216b03b4c7f2413d7fde931046096))

# [0.1.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.10) (2023-06-26)

### Bug Fixes

- types changed when updating to latest viem ([0aec96d](https://github.com/alchemyplatform/aa-sdk/commit/0aec96d184b5bcc3787ce9123260cf287f27f037))

# [0.1.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.9) (2023-06-26)

**Note:** Version bump only for package @alchemy/aa-core

# [0.1.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.6...v0.1.0-alpha.7) (2023-06-20)

**Note:** Version bump only for package @alchemy/aa-core

# [0.1.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.4...v0.1.0-alpha.5) (2023-06-16)

**Note:** Version bump only for package @alchemy/aa-core

# [0.1.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2023-06-14)

### Features

- expose more user op methods on the provider ([#25](https://github.com/alchemyplatform/aa-sdk/issues/25)) ([2f39460](https://github.com/alchemyplatform/aa-sdk/commit/2f3946063d78a4fe1a99078f8fd315d87b24a901))

# [0.1.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2023-06-12)

### Bug Fixes

- arbitrum min fee per bid needs to be a 1/10th the default on other chains ([#17](https://github.com/alchemyplatform/aa-sdk/issues/17)) ([453ecec](https://github.com/alchemyplatform/aa-sdk/commit/453ececb22e1981b27ed0635e0c763aa73e1a36f))
- import in core was still exporting deleted item ([4946408](https://github.com/alchemyplatform/aa-sdk/commit/4946408e757eab4e18a96d0a16839e92d78238d4))
- inject version was not using double quotes ([b7a7700](https://github.com/alchemyplatform/aa-sdk/commit/b7a77005bc0b04904911285ee0a9d3b610a73b89))

### Features

- add alchemy sub-package ([#22](https://github.com/alchemyplatform/aa-sdk/issues/22)) ([e7fc1aa](https://github.com/alchemyplatform/aa-sdk/commit/e7fc1aa93ebd57237009d3aa688d8c167f240aad))
- integrate sdk and refactor onboarding ([#12](https://github.com/alchemyplatform/aa-sdk/issues/12)) ([7dd7c97](https://github.com/alchemyplatform/aa-sdk/commit/7dd7c97ad10936fec0c9171d93745a891674c409))
- Support Arb Mainnet for Demo App ([#18](https://github.com/alchemyplatform/aa-sdk/issues/18)) ([6df907c](https://github.com/alchemyplatform/aa-sdk/commit/6df907cf8acb0fcf921b700a18d5bcb6d89c49f3))

# [0.1.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2023-06-02)

### Features

- add support for the new alchemy paymaster endpoint ([#14](https://github.com/alchemyplatform/aa-sdk/issues/14)) ([3fac515](https://github.com/alchemyplatform/aa-sdk/commit/3fac5152075b07ab91dea393e366b667149a3e23))

# [0.1.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.2...v0.1.0-alpha.0) (2023-05-31)

### Features

- add support for batching transactions in a userop ([#7](https://github.com/alchemyplatform/aa-sdk/issues/7)) ([79d63a7](https://github.com/alchemyplatform/aa-sdk/commit/79d63a79d26d6501d74dbf90de6c9a1158d931de))

## [0.0.1-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.1...v0.0.1-alpha.2) (2023-05-23)

**Note:** Version bump only for package @alchemy/aa-core

## [0.0.1-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.0...v0.0.1-alpha.1) (2023-05-22)

**Note:** Version bump only for package @alchemy/aa-core

## 0.0.1-alpha.0 (2023-05-22)

### Bug Fixes

- rename folders and update readme to reference correct package names ([8bbcaf7](https://github.com/alchemyplatform/aa-sdk/commit/8bbcaf76d2a9a945b30ce09fd2928a4a5eefb4be))

## [0.0.1-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.1...v0.0.1-alpha.0) (2023-05-22)

**Note:** Version bump only for package @alchemy/aa-core

## [0.0.1-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.0...v0.0.1-alpha.1) (2023-05-22)

**Note:** Version bump only for package @alchemy/aa-core

## 0.0.1-alpha.0 (2023-05-22)

### Bug Fixes

- rename folders and update readme to reference correct package names ([8bbcaf7](https://github.com/alchemyplatform/aa-sdk/commit/8bbcaf76d2a9a945b30ce09fd2928a4a5eefb4be))

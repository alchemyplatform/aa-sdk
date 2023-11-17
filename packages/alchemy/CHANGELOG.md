# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.2.0 (2023-11-17)

### Features

- make alchemy-sdk an optional dependency on aa-alchemy ([#265](https://github.com/alchemyplatform/aa-sdk/issues/265)) ([a0088b3](https://github.com/alchemyplatform/aa-sdk/commit/a0088b3ecce191ece21f4082a73c4fcae0e2286c))

# 1.1.0 (2023-11-14)

### Features

- merge development into main for new minor release ([#251](https://github.com/alchemyplatform/aa-sdk/issues/251)) ([ab098ee](https://github.com/alchemyplatform/aa-sdk/commit/ab098ee9ec35e4b1b3c788046168874fb51e4783))

# [1.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.2.0...v1.0.0) (2023-11-10)

### Features

- remove AA_SDK_TESTS_SIGNER_TYPE constant exported from aa-core ([#232](https://github.com/alchemyplatform/aa-sdk/issues/232)) ([883c489](https://github.com/alchemyplatform/aa-sdk/commit/883c489b077d587b6c5b50c44d92b2a00f10e5ac))
- support enhanced apis in alchemy provider ([#221](https://github.com/alchemyplatform/aa-sdk/issues/221)) ([83ea17f](https://github.com/alchemyplatform/aa-sdk/commit/83ea17f9c69123d9282871b6f3bb02ff64750625))
- use alchemy provider, light account for e2e tests ([#209](https://github.com/alchemyplatform/aa-sdk/issues/209)) ([124be68](https://github.com/alchemyplatform/aa-sdk/commit/124be68c5137a3511ec612e814265739e6909e75))

# 0.2.0 (2023-11-03)

### Features

- merge development into main for new version release ([#207](https://github.com/alchemyplatform/aa-sdk/issues/207)) ([f06fd2a](https://github.com/alchemyplatform/aa-sdk/commit/f06fd2adf5e4aaf90214435d32f9d566d8502099))

## 0.1.1 (2023-10-20)

### Bug Fixes

- bad deploy script again ([2da8de2](https://github.com/alchemyplatform/aa-sdk/commit/2da8de2f4feb4c82fd454050e66f6203b61bcc2c))

# [0.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.32...v0.1.0) (2023-10-10)

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

**Note:** Version bump only for package @alchemy/aa-alchemy

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

**Note:** Version bump only for package @alchemy/aa-alchemy

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

**Note:** Version bump only for package @alchemy/aa-alchemy

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

# [0.1.0-alpha.12](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.11...v0.1.0-alpha.12) (2023-06-27)

### Bug Fixes

- set opt/arb goerli base fee percentage to 0 ([#37](https://github.com/alchemyplatform/aa-sdk/issues/37)) ([db750f0](https://github.com/alchemyplatform/aa-sdk/commit/db750f09bc88cc7fd3a1d8e3ea0ff874ac656a7c))

# [0.1.0-alpha.11](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.10...v0.1.0-alpha.11) (2023-06-26)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [0.1.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.10) (2023-06-26)

### Bug Fixes

- types changed when updating to latest viem ([0aec96d](https://github.com/alchemyplatform/aa-sdk/commit/0aec96d184b5bcc3787ce9123260cf287f27f037))

# [0.1.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.9) (2023-06-26)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [0.1.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.7...v0.1.0-alpha.8) (2023-06-23)

### Bug Fixes

- **alchemy:** add opt mainnet to dummy gen ([#34](https://github.com/alchemyplatform/aa-sdk/issues/34)) ([ef21ad5](https://github.com/alchemyplatform/aa-sdk/commit/ef21ad514f9c1dfdfb49dedfd39586f58c2976c1))

# [0.1.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.6...v0.1.0-alpha.7) (2023-06-20)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [0.1.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.5...v0.1.0-alpha.6) (2023-06-19)

### Bug Fixes

- return scaled prio fee as max fee per gas ([#27](https://github.com/alchemyplatform/aa-sdk/issues/27)) ([56bc34b](https://github.com/alchemyplatform/aa-sdk/commit/56bc34be3a50a2709ca546ed90a980f3c489cbbe))

# [0.1.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.4...v0.1.0-alpha.5) (2023-06-16)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [0.1.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2023-06-14)

### Features

- add aa-accounts subpackage ([#23](https://github.com/alchemyplatform/aa-sdk/issues/23)) ([a7fd5da](https://github.com/alchemyplatform/aa-sdk/commit/a7fd5da8600b0a346627df3a4b5cc338210aa256))
- expose more user op methods on the provider ([#25](https://github.com/alchemyplatform/aa-sdk/issues/25)) ([2f39460](https://github.com/alchemyplatform/aa-sdk/commit/2f3946063d78a4fe1a99078f8fd315d87b24a901))

# [0.1.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2023-06-13)

### Bug Fixes

- imports are broken because missing .js extension ([98f4a54](https://github.com/alchemyplatform/aa-sdk/commit/98f4a5469b0ac01a833ede08c6c077373255ed22))

# [0.1.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2023-06-12)

### Features

- add alchemy sub-package ([#22](https://github.com/alchemyplatform/aa-sdk/issues/22)) ([e7fc1aa](https://github.com/alchemyplatform/aa-sdk/commit/e7fc1aa93ebd57237009d3aa688d8c167f240aad))

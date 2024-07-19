# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.6...v4.0.0-alpha.7) (2024-07-19)

### Bug Fixes

- exporting queryClient and typing uiConfig in example ([#844](https://github.com/alchemyplatform/aa-sdk/issues/844)) ([52ca509](https://github.com/alchemyplatform/aa-sdk/commit/52ca5098f6a9e1ebe83db0be43856d2d0e702f00))

### Features

- **erc7677:** create a new middle ware for erc7677 to replace gasManager middleWare ([#840](https://github.com/alchemyplatform/aa-sdk/issues/840)) ([62e2b59](https://github.com/alchemyplatform/aa-sdk/commit/62e2b59579e44f1825ae8224fb182aebd3c4f7e0))

# [4.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.6) (2024-07-18)

### Bug Fixes

- add missing react-remove-scroll dep ([#804](https://github.com/alchemyplatform/aa-sdk/issues/804)) ([51bfd62](https://github.com/alchemyplatform/aa-sdk/commit/51bfd62d7d6f05adfd93ba2777655ff13b9b69ef))
- add use client to a bunch of hooks that was misisng it ([#829](https://github.com/alchemyplatform/aa-sdk/issues/829)) ([160a336](https://github.com/alchemyplatform/aa-sdk/commit/160a336c9212f0ca6b69ef18fb68a86f8d3a7f6d))
- lowercase strings in the UI components ([#784](https://github.com/alchemyplatform/aa-sdk/issues/784)) ([2a047e0](https://github.com/alchemyplatform/aa-sdk/commit/2a047e03ff24e58d4bdbabbaaeab45cf3cda065c))
- merge base into this ([ea9ce2c](https://github.com/alchemyplatform/aa-sdk/commit/ea9ce2cabc407eec69aebe459446630142108f06))
- **ui-demo:** signer state was being cleared when ui config changed ([#838](https://github.com/alchemyplatform/aa-sdk/issues/838)) ([4fc5509](https://github.com/alchemyplatform/aa-sdk/commit/4fc55096f9486d6598f2c71b6366a221a3b74aa8))
- use updated package path in prettier config ([#741](https://github.com/alchemyplatform/aa-sdk/issues/741)) ([5c53efc](https://github.com/alchemyplatform/aa-sdk/commit/5c53efcbf2b4d983d9dcf2e831ef2ced2e9f7c50))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([3060a05](https://github.com/alchemyplatform/aa-sdk/commit/3060a05e895e6d6fef363276665f0d3d06c161fb))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([22b8183](https://github.com/alchemyplatform/aa-sdk/commit/22b8183ae297648d43594f59578163da6b0ae9bc)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- add ability to customize border radius in ui demo ([#785](https://github.com/alchemyplatform/aa-sdk/issues/785)) ([08e47af](https://github.com/alchemyplatform/aa-sdk/commit/08e47af7c42cc379803cde5ebf50e8accfd2c139))
- add border radius to account kit theme config ([#781](https://github.com/alchemyplatform/aa-sdk/issues/781)) ([9d308f8](https://github.com/alchemyplatform/aa-sdk/commit/9d308f814db1481a098aeddcde24bcf94c7cdbee))
- add doc generator for class methods ([#806](https://github.com/alchemyplatform/aa-sdk/issues/806)) ([4102ae0](https://github.com/alchemyplatform/aa-sdk/commit/4102ae051a5a8ac03fb88f08adc8b3bca0f9737e))
- add UI config defaults, better back navigation to auth UI ([#827](https://github.com/alchemyplatform/aa-sdk/issues/827)) ([0902810](https://github.com/alchemyplatform/aa-sdk/commit/090281067aff306536a2482df39f8da8f428e101))
- clean up UI state on log out ([#832](https://github.com/alchemyplatform/aa-sdk/issues/832)) ([eb87340](https://github.com/alchemyplatform/aa-sdk/commit/eb8734031b0b8132b7d1e7d19f7b57dfeda920c3))
- enable linting class methods from exported classes ([20df68e](https://github.com/alchemyplatform/aa-sdk/commit/20df68ecc722ee4c87b75f1880debe4591be5bb5))
- icon animations ([#717](https://github.com/alchemyplatform/aa-sdk/issues/717)) ([e98a3e2](https://github.com/alchemyplatform/aa-sdk/commit/e98a3e25f795a5b6a4a05441df8734b431e23211))
- new and improved auth modal ([#761](https://github.com/alchemyplatform/aa-sdk/issues/761)) ([4ba79d2](https://github.com/alchemyplatform/aa-sdk/commit/4ba79d2ca1c8c1b087cae8beb12a3b28c23c3978))
- read auth card props from context, simplify UI config ([#789](https://github.com/alchemyplatform/aa-sdk/issues/789)) ([4b17859](https://github.com/alchemyplatform/aa-sdk/commit/4b178596431035a75a47b8ccd02c1f9201009b38))
- respect OS or root class for dark mode ([#759](https://github.com/alchemyplatform/aa-sdk/issues/759)) ([b00e739](https://github.com/alchemyplatform/aa-sdk/commit/b00e739b07191c0791e044e2c9513022c662662f))
- smaller footer in UI components ([#811](https://github.com/alchemyplatform/aa-sdk/issues/811)) ([0960dfe](https://github.com/alchemyplatform/aa-sdk/commit/0960dfe010607950797f59076e44cf23b5581adb))
- some UI component polish from sync with product ([#831](https://github.com/alchemyplatform/aa-sdk/issues/831)) ([4d30643](https://github.com/alchemyplatform/aa-sdk/commit/4d306432ae5830cecaeb41097ceb52e78d41d9eb))
- support different illustration styles ([#767](https://github.com/alchemyplatform/aa-sdk/issues/767)) ([119fb04](https://github.com/alchemyplatform/aa-sdk/commit/119fb046da61ca9139c664c42ed6a6d0184493fa))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([637bb95](https://github.com/alchemyplatform/aa-sdk/commit/637bb953d59bfd931652286dfc73497b0e0e288f))
- use brand accent color as icon colors ([#780](https://github.com/alchemyplatform/aa-sdk/issues/780)) ([c42bf43](https://github.com/alchemyplatform/aa-sdk/commit/c42bf431ac3a43e9a6dcc41e140880266f674b45))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

# [4.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.4...v4.0.0-alpha.5) (2024-07-11)

### Bug Fixes

- add use client to a bunch of hooks that was misisng it ([#829](https://github.com/alchemyplatform/aa-sdk/issues/829)) ([768505e](https://github.com/alchemyplatform/aa-sdk/commit/768505ef8122991067afbaa1a8977dd900bcea92))

### Features

- smaller footer in UI components ([#811](https://github.com/alchemyplatform/aa-sdk/issues/811)) ([dfab5c8](https://github.com/alchemyplatform/aa-sdk/commit/dfab5c839dc782b21ba4d05f1892982133606cec))

# [4.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.3...v4.0.0-alpha.4) (2024-07-10)

### Features

- read auth card props from context, simplify UI config ([#789](https://github.com/alchemyplatform/aa-sdk/issues/789)) ([ac44833](https://github.com/alchemyplatform/aa-sdk/commit/ac448334ed87b3937c5401820d6fec06be80d529))

# [4.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2024-07-09)

**Note:** Version bump only for package @account-kit/react

# [4.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.18.2...v4.0.0-alpha.2) (2024-07-08)

### Bug Fixes

- add missing react-remove-scroll dep ([#804](https://github.com/alchemyplatform/aa-sdk/issues/804)) ([1b97980](https://github.com/alchemyplatform/aa-sdk/commit/1b9798026cea202c797554bd4000f32958481507))
- lowercase strings in the UI components ([#784](https://github.com/alchemyplatform/aa-sdk/issues/784)) ([e840d78](https://github.com/alchemyplatform/aa-sdk/commit/e840d78c1da9b032b780904b6419635bd464ff64))
- use updated package path in prettier config ([#741](https://github.com/alchemyplatform/aa-sdk/issues/741)) ([e950d58](https://github.com/alchemyplatform/aa-sdk/commit/e950d580b01d1f862119f500a318c8469269c37d))

### Code Refactoring

- change the prefix for aa-sdk packages ([#722](https://github.com/alchemyplatform/aa-sdk/issues/722)) ([0601453](https://github.com/alchemyplatform/aa-sdk/commit/060145386572026905f5720866722c5a20c9d7db))
- split aa-alchemy into account-kit packages ([#704](https://github.com/alchemyplatform/aa-sdk/issues/704)) ([b2b7cc6](https://github.com/alchemyplatform/aa-sdk/commit/b2b7cc680860f3d416d11b66d626e715fae4cf8b)), closes [#706](https://github.com/alchemyplatform/aa-sdk/issues/706)

### Features

- add ability to customize border radius in ui demo ([#785](https://github.com/alchemyplatform/aa-sdk/issues/785)) ([475a0e2](https://github.com/alchemyplatform/aa-sdk/commit/475a0e239f9100cc0ecddc324030647625b0bb7f))
- add border radius to account kit theme config ([#781](https://github.com/alchemyplatform/aa-sdk/issues/781)) ([9493ed4](https://github.com/alchemyplatform/aa-sdk/commit/9493ed4e491afea8cbf9ffb707de638677e71202))
- icon animations ([#717](https://github.com/alchemyplatform/aa-sdk/issues/717)) ([a4f9107](https://github.com/alchemyplatform/aa-sdk/commit/a4f9107571933fe26e3102dae0da3076f3c4a249))
- new and improved auth modal ([#761](https://github.com/alchemyplatform/aa-sdk/issues/761)) ([43f103f](https://github.com/alchemyplatform/aa-sdk/commit/43f103f87b1e5358d6f7211dca9337097a30f200))
- respect OS or root class for dark mode ([#759](https://github.com/alchemyplatform/aa-sdk/issues/759)) ([6a43fe6](https://github.com/alchemyplatform/aa-sdk/commit/6a43fe63639a825c168eac2ef03b189044755690))
- support different illustration styles ([#767](https://github.com/alchemyplatform/aa-sdk/issues/767)) ([97d0009](https://github.com/alchemyplatform/aa-sdk/commit/97d00098961ea8bed47fd6c963fcf3980b950a10))
- surface descriptive session key errors ([#718](https://github.com/alchemyplatform/aa-sdk/issues/718)) ([4c0b2f1](https://github.com/alchemyplatform/aa-sdk/commit/4c0b2f19a59272940b3fe40c610c06ad8c49d70e))
- use brand accent color as icon colors ([#780](https://github.com/alchemyplatform/aa-sdk/issues/780)) ([a91dd04](https://github.com/alchemyplatform/aa-sdk/commit/a91dd04fe1c7b175ffdae2773a0aa56fac9ae3c8))

### BREAKING CHANGES

- @alchemy/aa-_ packages have been renamed to @aa-sdk/_
- this removes the @alchemy/aa-alchemy package in favor of @account-kit/\*
- @alchemy/aa-accounts was deleted in favor of @account-kit/accounts

- refactor: further rename packages

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

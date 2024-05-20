# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.15.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.14.1...v3.15.0) (2024-05-20)

### Bug Fixes

- account state was not syncing across chain changes ([#672](https://github.com/alchemyplatform/aa-sdk/issues/672)) ([c4e47d5](https://github.com/alchemyplatform/aa-sdk/commit/c4e47d5d97d26c4bfb5922a45181f4138eb9dc9c))

### Features

- allow setting gas manager config in the config ([#670](https://github.com/alchemyplatform/aa-sdk/issues/670)) ([38dfa25](https://github.com/alchemyplatform/aa-sdk/commit/38dfa2578e1dccdedca5295b2c2871bafa1aef7c))

## [3.14.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.14.0...v3.14.1) (2024-05-17)

### Bug Fixes

- **light-account:** uo signing should use message raw ([#671](https://github.com/alchemyplatform/aa-sdk/issues/671)) ([89224a8](https://github.com/alchemyplatform/aa-sdk/commit/89224a8e54998726753ca5c6a9a69265859f20b5))

# [3.14.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.13.1...v3.14.0) (2024-05-17)

### Bug Fixes

- **aa-alchemy/config:** export missing actions ([175dc20](https://github.com/alchemyplatform/aa-sdk/commit/175dc200404373686f1654ff72404edd04c31cbd))

### Features

- add multi-chain support to account configs ([#666](https://github.com/alchemyplatform/aa-sdk/issues/666)) ([60994e9](https://github.com/alchemyplatform/aa-sdk/commit/60994e983a93bff97400a565dd755a2e8dab2655))

## [3.13.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.13.0...v3.13.1) (2024-05-14)

### Bug Fixes

- **msca:** fix the generic on getMAInitializationData ([#664](https://github.com/alchemyplatform/aa-sdk/issues/664)) ([9747986](https://github.com/alchemyplatform/aa-sdk/commit/97479862f22a63f3888d8190ccf1693be597df36))

# [3.13.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.4...v3.13.0) (2024-05-10)

### Bug Fixes

- **light-account:** light account v2 signatures should have sig type ([#663](https://github.com/alchemyplatform/aa-sdk/issues/663)) ([54764a9](https://github.com/alchemyplatform/aa-sdk/commit/54764a9215c4d2213905ba301670316f697a4169))

### Features

- add email loading state to the modal ([8d0d244](https://github.com/alchemyplatform/aa-sdk/commit/8d0d24408652cbc48ea4cd44ed0c98c1cb68d2f8))
- add passkey loading state ([b56fe8d](https://github.com/alchemyplatform/aa-sdk/commit/b56fe8d240e58392b15f6a58d79fe580f8118772))
- add support for adding a passkey on signup ([ab6bad3](https://github.com/alchemyplatform/aa-sdk/commit/ab6bad3a24bd8736e1fbe15881f4b156492b2dae))
- **ui:** start adding use authenticate calls to the modal ([c2ef8eb](https://github.com/alchemyplatform/aa-sdk/commit/c2ef8ebf437226c41e05bc310b9a7b39459c94c1))

## [3.12.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.3...v3.12.4) (2024-05-10)

### Bug Fixes

- alchemy paymaster 0x override was not awaiting gas estimates ([#660](https://github.com/alchemyplatform/aa-sdk/issues/660)) ([51d31ff](https://github.com/alchemyplatform/aa-sdk/commit/51d31fff352472ea3f2564f87620d217f9bb2b85))

## [3.12.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.2...v3.12.3) (2024-05-10)

### Bug Fixes

- update light account dummy signature for v2 ([#662](https://github.com/alchemyplatform/aa-sdk/issues/662)) ([5ac35a3](https://github.com/alchemyplatform/aa-sdk/commit/5ac35a3707cb5ade6e0a2b2f2bd8d0b61f5ac1e8))

## [3.12.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.1...v3.12.2) (2024-05-09)

### Bug Fixes

- paymaster bypass wasn't working correctly ([9e6b927](https://github.com/alchemyplatform/aa-sdk/commit/9e6b9272fd990ea3edaa83ce579f25245dcfee5f))

## [3.12.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.0...v3.12.1) (2024-05-07)

### Bug Fixes

- **alchemy:** remove typescript-cookie because its not cjs compatible ([#652](https://github.com/alchemyplatform/aa-sdk/issues/652)) ([21eeb63](https://github.com/alchemyplatform/aa-sdk/commit/21eeb6373bd11b7bf149ae12dce3c045abefd8e3))
- replace fraxTestnet with fraxSepolia ([#642](https://github.com/alchemyplatform/aa-sdk/issues/642)) ([320a15d](https://github.com/alchemyplatform/aa-sdk/commit/320a15d049e9ad6125e9e4102a3fc1ebe8f0dd55))

# [3.12.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.11.1...v3.12.0) (2024-05-02)

### Bug Fixes

- don't set undefined estimates to 0n ([#641](https://github.com/alchemyplatform/aa-sdk/issues/641)) ([bff8d35](https://github.com/alchemyplatform/aa-sdk/commit/bff8d351a1587589799e515e7373fbcf01a3b6e9))

### Features

- add form input stylings ([76e961a](https://github.com/alchemyplatform/aa-sdk/commit/76e961af5f90db2c3c502d244ab16b007d4e0542))
- prototype the auth modal hook ([#638](https://github.com/alchemyplatform/aa-sdk/issues/638)) ([ebed224](https://github.com/alchemyplatform/aa-sdk/commit/ebed22421c352e0be20f9c28e6aa77abb6ee1e98))
- start adding the ui component engine ([7368385](https://github.com/alchemyplatform/aa-sdk/commit/736838540b9cd6b5a05c1ee3934e08dc5f7f6fb7))

## [3.11.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.11.0...v3.11.1) (2024-04-30)

### Bug Fixes

- make multisig e2e tests pass ([#615](https://github.com/alchemyplatform/aa-sdk/issues/615)) ([08cf8d8](https://github.com/alchemyplatform/aa-sdk/commit/08cf8d81b3afd7b06c51a3b9fe6a0ee5a0a91d44))
- when overriding paymaster set fields to 0x initially ([#635](https://github.com/alchemyplatform/aa-sdk/issues/635)) ([2a03c67](https://github.com/alchemyplatform/aa-sdk/commit/2a03c679720e408ff7a56b4c0e545bf2ae47f446))

# [3.11.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.10.0...v3.11.0) (2024-04-30)

### Bug Fixes

- determine entry point version from light account version ([#632](https://github.com/alchemyplatform/aa-sdk/issues/632)) ([7813de0](https://github.com/alchemyplatform/aa-sdk/commit/7813de0630143ce3e4902a98f8e582c418d0050a))
- update the tsconfig in the docs site to match typing in the rest of the repo ([#631](https://github.com/alchemyplatform/aa-sdk/issues/631)) ([9f85aef](https://github.com/alchemyplatform/aa-sdk/commit/9f85aef93c06127dc75c775223f5bc9633150d74))
- waitForUserOperationTx parameters were incorrect ([#634](https://github.com/alchemyplatform/aa-sdk/issues/634)) ([8250c66](https://github.com/alchemyplatform/aa-sdk/commit/8250c660def2c3b8b920b3239d782d1999fd578e))

### Features

- use final LightAccount v2 addresses ([#628](https://github.com/alchemyplatform/aa-sdk/issues/628)) ([7539713](https://github.com/alchemyplatform/aa-sdk/commit/7539713ce8e5b5e86c087866d04299f20e21b448))

# [3.10.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0...v3.10.0) (2024-04-29)

### Features

- add frax and zora defaults ([#613](https://github.com/alchemyplatform/aa-sdk/issues/613)) ([4950a1d](https://github.com/alchemyplatform/aa-sdk/commit/4950a1df170abcae5a3cc5a32acdb972890d7810))
- estimate user operation gas smart account client action and how to guide ([#603](https://github.com/alchemyplatform/aa-sdk/issues/603)) ([522a038](https://github.com/alchemyplatform/aa-sdk/commit/522a03864ea0e3f8f1e34b6900c3ca0241b534e8))
- handle one off bypassing paymaster and data middleware case ([#606](https://github.com/alchemyplatform/aa-sdk/issues/606)) ([b5d8110](https://github.com/alchemyplatform/aa-sdk/commit/b5d8110f629937068d27e059ec89dfaa31ce9dd5))
- make create light account and multi owner light account to be strong type inferred ([#608](https://github.com/alchemyplatform/aa-sdk/issues/608)) ([f2dd460](https://github.com/alchemyplatform/aa-sdk/commit/f2dd460ca937065dac05fd7d64e8f31c1f8d1a74))
- remove generic entry point version specification requirement for better devex ([#607](https://github.com/alchemyplatform/aa-sdk/issues/607)) ([f3fb619](https://github.com/alchemyplatform/aa-sdk/commit/f3fb619e3cfb2c3a957a259788ae6ab1c530f3d5))

# [3.9.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0-alpha.4...v3.9.0) (2024-04-24)

### Features

- add a useClientActions hook ([#571](https://github.com/alchemyplatform/aa-sdk/issues/571)) ([42692e4](https://github.com/alchemyplatform/aa-sdk/commit/42692e4b7c7b5486f8c230157fdb0fc98370a389))
- add split transport ([#590](https://github.com/alchemyplatform/aa-sdk/issues/590)) ([2d3687f](https://github.com/alchemyplatform/aa-sdk/commit/2d3687f2009a4d0ca7f0dc9fc6f8c420376a35a3))
- revised LightAccount v2 1271 sigs ([#614](https://github.com/alchemyplatform/aa-sdk/issues/614)) ([378c83b](https://github.com/alchemyplatform/aa-sdk/commit/378c83b68813e7b393f26c5cf7ba46827fc7a7d0))

# [3.9.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0-alpha.3...v3.9.0-alpha.4) (2024-04-19)

### Features

- add js docs to account provider ([#602](https://github.com/alchemyplatform/aa-sdk/issues/602)) ([2853f5e](https://github.com/alchemyplatform/aa-sdk/commit/2853f5e34eb5d4dab7525b452ddb5af8e020cd46))

# [3.9.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0-alpha.2...v3.9.0-alpha.3) (2024-04-19)

### Features

- add js docs to account provider undefined error ([#601](https://github.com/alchemyplatform/aa-sdk/issues/601)) ([3eb191e](https://github.com/alchemyplatform/aa-sdk/commit/3eb191e7634632b641804afb6e264361c3f664cb))

# [3.9.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0-alpha.1...v3.9.0-alpha.2) (2024-04-19)

### Features

- add js docs to client undefined error ([#600](https://github.com/alchemyplatform/aa-sdk/issues/600)) ([7eabe78](https://github.com/alchemyplatform/aa-sdk/commit/7eabe7843acfa3e10d20bb362082a6d159df9747))

# [3.9.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.9.0-alpha.0...v3.9.0-alpha.1) (2024-04-19)

### Bug Fixes

- addes permissions to write to repo for publish ([#598](https://github.com/alchemyplatform/aa-sdk/issues/598)) ([292bebb](https://github.com/alchemyplatform/aa-sdk/commit/292bebb39046e616f096bbeb613a44a98c4303df))

### Features

- add js docs to types ([#599](https://github.com/alchemyplatform/aa-sdk/issues/599)) ([c781e81](https://github.com/alchemyplatform/aa-sdk/commit/c781e811e5d0347953ca0a2d7511fc46747e473b))

# [3.9.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.2-alpha.1...v3.9.0-alpha.0) (2024-04-19)

### Features

- add sendTransaction and sendTransactions hooks ([#589](https://github.com/alchemyplatform/aa-sdk/issues/589)) ([184bfa0](https://github.com/alchemyplatform/aa-sdk/commit/184bfa0b8efb20ae95fe751694f35ca88b899cdd))
- add useExportAccount hook ([#567](https://github.com/alchemyplatform/aa-sdk/issues/567)) ([50770d8](https://github.com/alchemyplatform/aa-sdk/commit/50770d89e88f58709c0de0e4cbd5854482b19359))
- add useLogout hook ([#566](https://github.com/alchemyplatform/aa-sdk/issues/566)) ([a64cf7f](https://github.com/alchemyplatform/aa-sdk/commit/a64cf7f5fa603f0c55792f61af9ef4f992200a54))
- add useSendUserOperation and useDropAndReplaceUserOperation hooks ([#581](https://github.com/alchemyplatform/aa-sdk/issues/581)) ([877785d](https://github.com/alchemyplatform/aa-sdk/commit/877785d0bebe5a383045ffab84a498c116d9fbcd))
- add useSignMessage and useSignTypedData hooks ([#568](https://github.com/alchemyplatform/aa-sdk/issues/568)) ([de5262c](https://github.com/alchemyplatform/aa-sdk/commit/de5262c585260925adfa08e21d008fa8011284a9))
- add useWaitForUserOperationTransaction hook ([#582](https://github.com/alchemyplatform/aa-sdk/issues/582)) ([176548f](https://github.com/alchemyplatform/aa-sdk/commit/176548f4ae712c7e6d0173c12fc436994ffedb95))
- update useAuthenticate and useAccount to include mutation args ([#592](https://github.com/alchemyplatform/aa-sdk/issues/592)) ([1508d7d](https://github.com/alchemyplatform/aa-sdk/commit/1508d7dc184600cbd6683fff0d48cd4abdb13839))

## [3.8.2-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.1...v3.8.2-alpha.1) (2024-04-18)

### Bug Fixes

- fix audit link ([#588](https://github.com/alchemyplatform/aa-sdk/issues/588)) ([b61e9d8](https://github.com/alchemyplatform/aa-sdk/commit/b61e9d835ea38b3a73c0b0804007c7d5bca0f86a))
- fix bugs found in entrypoint v7 during testing ([#578](https://github.com/alchemyplatform/aa-sdk/issues/578)) ([924bb45](https://github.com/alchemyplatform/aa-sdk/commit/924bb459de9bacbd5682de72fe3f016ac5e25cd3))

### Features

- add useAddPasskey hook ([#565](https://github.com/alchemyplatform/aa-sdk/issues/565)) ([27b3bde](https://github.com/alchemyplatform/aa-sdk/commit/27b3bde8b9593055f213f15fbefe07e3a010bd60))
- **entrypoint-0.7:** base - all changes in regards to the EntryPoint v6 & v7 support ([#514](https://github.com/alchemyplatform/aa-sdk/issues/514)) ([6cc692e](https://github.com/alchemyplatform/aa-sdk/commit/6cc692edf2ac20adf310b7a0efd99879b6e6f485)), closes [#549](https://github.com/alchemyplatform/aa-sdk/issues/549)
- light account v2 entrypoint v7 and multi owner update ([#548](https://github.com/alchemyplatform/aa-sdk/issues/548)) ([5f2f5c9](https://github.com/alchemyplatform/aa-sdk/commit/5f2f5c963ecdeb8c7efadb6eda2f2e9e6187f636))
- move signUserOperation middleware step out of asyncPipe ([#587](https://github.com/alchemyplatform/aa-sdk/issues/587)) ([2685d14](https://github.com/alchemyplatform/aa-sdk/commit/2685d14bd550eec3fbb2185f22feae7028d484c1))
- paymaster middleware update per entrypoint v7 user operation ([#580](https://github.com/alchemyplatform/aa-sdk/issues/580)) ([399479a](https://github.com/alchemyplatform/aa-sdk/commit/399479a38d6eaf0ab6d4d46b38f9d0f5a773cbed))

## [3.8.2-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.1...v3.8.2-alpha.0) (2024-04-17)

### Bug Fixes

- fix bugs found in entrypoint v7 during testing ([#578](https://github.com/alchemyplatform/aa-sdk/issues/578)) ([924bb45](https://github.com/alchemyplatform/aa-sdk/commit/924bb459de9bacbd5682de72fe3f016ac5e25cd3))

### Features

- **entrypoint-0.7:** base - all changes in regards to the EntryPoint v6 & v7 support ([#514](https://github.com/alchemyplatform/aa-sdk/issues/514)) ([6cc692e](https://github.com/alchemyplatform/aa-sdk/commit/6cc692edf2ac20adf310b7a0efd99879b6e6f485)), closes [#549](https://github.com/alchemyplatform/aa-sdk/issues/549)
- light account v2 entrypoint v7 and multi owner update ([#548](https://github.com/alchemyplatform/aa-sdk/issues/548)) ([5f2f5c9](https://github.com/alchemyplatform/aa-sdk/commit/5f2f5c963ecdeb8c7efadb6eda2f2e9e6187f636))
- paymaster middleware update per entrypoint v7 user operation ([1709533](https://github.com/alchemyplatform/aa-sdk/commit/1709533ba9cd227e2c3c7c9cb848f921bde353f4))

## [3.8.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.0...v3.8.1) (2024-04-11)

### Bug Fixes

- add the signer header when using aa-alchemy ([#563](https://github.com/alchemyplatform/aa-sdk/issues/563)) ([7cfeaa6](https://github.com/alchemyplatform/aa-sdk/commit/7cfeaa6f093f929f59f1055fc16e07840bf487a0))
- adding passport signer guide to sidebar ([#570](https://github.com/alchemyplatform/aa-sdk/issues/570)) ([965f746](https://github.com/alchemyplatform/aa-sdk/commit/965f746f6a2be21e8ea596b6c2f7e2240c186a28))
- **alchemy:** fix the gas manager middleware to leave fees and gas unset ([#572](https://github.com/alchemyplatform/aa-sdk/issues/572)) ([463e481](https://github.com/alchemyplatform/aa-sdk/commit/463e48140d385962b2ba0795795600cd657da62c))

# [3.8.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.3...v3.8.0) (2024-04-10)

### Bug Fixes

- address some of the plugin and session key docs and usability ([#562](https://github.com/alchemyplatform/aa-sdk/issues/562)) ([12c02e9](https://github.com/alchemyplatform/aa-sdk/commit/12c02e97a49651dc452b0920803a4efa0fae2f2e))
- invalid user operation error mesages to correctly serialize bigint fields ([#557](https://github.com/alchemyplatform/aa-sdk/issues/557)) ([29c2fc6](https://github.com/alchemyplatform/aa-sdk/commit/29c2fc6e347aca5c3278b302f2b492a6f67f3d8e))

### Features

- add alchemy accounts context ([#539](https://github.com/alchemyplatform/aa-sdk/issues/539)) ([f92469e](https://github.com/alchemyplatform/aa-sdk/commit/f92469ee3f1a5bc3e9f8fe72d6067de1f28e24dd)), closes [#561](https://github.com/alchemyplatform/aa-sdk/issues/561)
- add passport signer to aa-signers ([#550](https://github.com/alchemyplatform/aa-sdk/issues/550)) ([c7857ce](https://github.com/alchemyplatform/aa-sdk/commit/c7857cec047056d56e4b964b7a463fcb7171862d))
- **alchemy-signer:** emit events from the alchemy signer on state changes ([#523](https://github.com/alchemyplatform/aa-sdk/issues/523)) ([8880e6d](https://github.com/alchemyplatform/aa-sdk/commit/8880e6d5bb9c98524c726a841fab5019bd6f0049))
- **multi-sig:** add multisig plugin ([#519](https://github.com/alchemyplatform/aa-sdk/issues/519)) ([0139ef6](https://github.com/alchemyplatform/aa-sdk/commit/0139ef6de9b593dbe239675485a531122da254c4)), closes [#536](https://github.com/alchemyplatform/aa-sdk/issues/536)

## [3.7.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.2...v3.7.3) (2024-03-28)

### Bug Fixes

- **alchemy-signer:** fix the passkey creation flow ([#534](https://github.com/alchemyplatform/aa-sdk/issues/534)) ([ef50ac4](https://github.com/alchemyplatform/aa-sdk/commit/ef50ac4def125270a99d73402d6f8903dbbf97d6))

## [3.7.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.1...v3.7.2) (2024-03-27)

**Note:** Version bump only for package root

## [3.7.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.0...v3.7.1) (2024-03-27)

### Bug Fixes

- dummy paymaster and data addresses updates ([#532](https://github.com/alchemyplatform/aa-sdk/issues/532)) ([baab7bd](https://github.com/alchemyplatform/aa-sdk/commit/baab7bd7500157af744fe1c581ac12cbe2e0d8b2))

# [3.7.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.6.1...v3.7.0) (2024-03-27)

### Bug Fixes

- Rename documentation_request to documentation_request.md ([06cc811](https://github.com/alchemyplatform/aa-sdk/commit/06cc8118faba24d7edef658074922a1b5238e7c9))
- updating import in eoa guide ([#525](https://github.com/alchemyplatform/aa-sdk/issues/525)) ([6c1c28f](https://github.com/alchemyplatform/aa-sdk/commit/6c1c28f69b740132f5ef73605bfd001ade863a8f))

### Features

- update dummy paymaster and data ([#531](https://github.com/alchemyplatform/aa-sdk/issues/531)) ([956873b](https://github.com/alchemyplatform/aa-sdk/commit/956873b768afa63747aacfb6252e5ac3b4655f65))

## [3.6.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.6.0...v3.6.1) (2024-03-18)

### Bug Fixes

- **core:** fix stateoverrides passed to estimation userop gas ([#517](https://github.com/alchemyplatform/aa-sdk/issues/517)) ([2980a35](https://github.com/alchemyplatform/aa-sdk/commit/2980a35226b5e42e4f3aaa77fd53564a3486327b))

# [3.6.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.5.1...v3.6.0) (2024-03-18)

### Features

- add optional stateOverride parameter to eth_estimateUserOperationGas ([#513](https://github.com/alchemyplatform/aa-sdk/issues/513)) ([3e0b88a](https://github.com/alchemyplatform/aa-sdk/commit/3e0b88a5e8adf322e5f5f2c659f57d94bc2cc95c))
- add polygon amoy default addresses ([#506](https://github.com/alchemyplatform/aa-sdk/issues/506)) ([34f273e](https://github.com/alchemyplatform/aa-sdk/commit/34f273e8b6d89c7c80f9de57e0331090602e776a))
- create documentation_request issue template ([#515](https://github.com/alchemyplatform/aa-sdk/issues/515)) ([aa5ad21](https://github.com/alchemyplatform/aa-sdk/commit/aa5ad21e659069923acd0939a17bf140cdf10638))

## [3.5.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.5.0...v3.5.1) (2024-03-14)

**Note:** Version bump only for package root

# [3.5.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.4...v3.5.0) (2024-03-14)

### Bug Fixes

- **alchemy-signer:** check if process is defined before reading env vars ([#508](https://github.com/alchemyplatform/aa-sdk/issues/508)) ([bce8123](https://github.com/alchemyplatform/aa-sdk/commit/bce81239457c05bf1ee3560513bf6c140167ad04))
- fix plugingen script for no input param provider function generation ([#509](https://github.com/alchemyplatform/aa-sdk/issues/509)) ([c5f2561](https://github.com/alchemyplatform/aa-sdk/commit/c5f2561755e59a5bb7b6ec1d8b9ec8840a07fb82))

### Features

- **plugins:** make plugingen a cli tool ([#507](https://github.com/alchemyplatform/aa-sdk/issues/507)) ([53ba81d](https://github.com/alchemyplatform/aa-sdk/commit/53ba81d33422bb3f18134c1dd75e68d64f5cc3f0))

## [3.4.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.3...v3.4.4) (2024-03-12)

### Bug Fixes

- **alchemy-signer:** set the user during passkey account creation ([#503](https://github.com/alchemyplatform/aa-sdk/issues/503)) ([a6669c6](https://github.com/alchemyplatform/aa-sdk/commit/a6669c6f35ba04fa1d2d33b79f74ab24af74804c))

## [3.4.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.2...v3.4.3) (2024-03-11)

### Bug Fixes

- **alchemy-signer:** allow for org id to be passed with bundle ([#501](https://github.com/alchemyplatform/aa-sdk/issues/501)) ([8c06f4f](https://github.com/alchemyplatform/aa-sdk/commit/8c06f4f42c312e2e14d9854f536b1badf787abe2))

## [3.4.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.1...v3.4.2) (2024-03-08)

### Bug Fixes

- **alchemy-signer:** persist temporary session state to localstorage always ([#500](https://github.com/alchemyplatform/aa-sdk/issues/500)) ([fe84685](https://github.com/alchemyplatform/aa-sdk/commit/fe846858da955fa2c316283aabff31aa0d2c2525))

## [3.4.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.0...v3.4.1) (2024-03-02)

### Bug Fixes

- allow rpid override in signer ([9dd7818](https://github.com/alchemyplatform/aa-sdk/commit/9dd781887f814a318f4ddabceedefd1298648918))

# [3.4.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.3.0...v3.4.0) (2024-02-29)

### Bug Fixes

- **alchemy-signer:** undo a whoami change ([#495](https://github.com/alchemyplatform/aa-sdk/issues/495)) ([c88a965](https://github.com/alchemyplatform/aa-sdk/commit/c88a965e4a21816450b5baaa5820fa2389ed9199))

### Features

- export plugin install and uninstall param type from aa accounts package ([#494](https://github.com/alchemyplatform/aa-sdk/issues/494)) ([749180f](https://github.com/alchemyplatform/aa-sdk/commit/749180f176e7bcb85bbe49b098e04424c07791a9))
- sign user op and send raw user op methods added to smart account client ([#486](https://github.com/alchemyplatform/aa-sdk/issues/486)) ([6518d12](https://github.com/alchemyplatform/aa-sdk/commit/6518d12190e9d48263e4776f288245b5a9940b36))

# [3.3.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.2.1...v3.3.0) (2024-02-29)

### Features

- **alchemy-signer:** migrate the alchemy signer to use bundle from QP ([#492](https://github.com/alchemyplatform/aa-sdk/issues/492)) ([cd6f491](https://github.com/alchemyplatform/aa-sdk/commit/cd6f491ffb66de3924024420e76e5350f831497c))
- export Plugin type from aa accounts package ([#493](https://github.com/alchemyplatform/aa-sdk/issues/493)) ([03543fb](https://github.com/alchemyplatform/aa-sdk/commit/03543fb3a5886110b3bad4d792efd5c01045d0a6))

## [3.2.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.2.0...v3.2.1) (2024-02-27)

### Bug Fixes

- **actions:** drop and replace was not handling overrides ([#490](https://github.com/alchemyplatform/aa-sdk/issues/490)) ([83f5867](https://github.com/alchemyplatform/aa-sdk/commit/83f5867dd72e1daccba12cafd56d6aa070ef17f1))

# [3.2.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.2...v3.2.0) (2024-02-26)

### Features

- allow multiple signer addresses to be passed to msca upgrade util ([#489](https://github.com/alchemyplatform/aa-sdk/issues/489)) ([f843302](https://github.com/alchemyplatform/aa-sdk/commit/f8433028aa4363a156e99f2d86729e1a24ac082c))

## [3.1.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.1...v3.1.2) (2024-02-26)

### Bug Fixes

- **alchemy-signer:** missing transports on iOS during passkey creation ([#488](https://github.com/alchemyplatform/aa-sdk/issues/488)) ([740946f](https://github.com/alchemyplatform/aa-sdk/commit/740946f14f5a67b986e136269c564f79811f5d23))
- patch fixed incorrectly identifies some private IP addresses as public ([#487](https://github.com/alchemyplatform/aa-sdk/issues/487)) ([9835574](https://github.com/alchemyplatform/aa-sdk/commit/9835574f672cb5b5db4152256a9eed6c6a62d893))

## [3.1.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.0...v3.1.1) (2024-02-23)

### Bug Fixes

- custom headers fix ([#484](https://github.com/alchemyplatform/aa-sdk/issues/484)) ([5baacad](https://github.com/alchemyplatform/aa-sdk/commit/5baacad5e806b111eed86174408c78612b856523))

# [3.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.1...v3.1.0) (2024-02-23)

### Bug Fixes

- tx signing needs to happen over hash of RLP ([#481](https://github.com/alchemyplatform/aa-sdk/issues/481)) ([e3d7371](https://github.com/alchemyplatform/aa-sdk/commit/e3d737175abab6f4ccb16e4e22e0ec4f58c4e736))

### Features

- make it easier to upgrade to MA ([#482](https://github.com/alchemyplatform/aa-sdk/issues/482)) ([7f7710a](https://github.com/alchemyplatform/aa-sdk/commit/7f7710accfd088ffc9a5e6c54797d4dc5f038bac))
- support using AlchemySigner as EOA ([#467](https://github.com/alchemyplatform/aa-sdk/issues/467)) ([b620671](https://github.com/alchemyplatform/aa-sdk/commit/b6206717afb51267a406a6d2fd48af5593888fdf))

## [3.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0...v3.0.1) (2024-02-21)

### Bug Fixes

- custom Alchemy-AA-Sdk-Version header fix ([#475](https://github.com/alchemyplatform/aa-sdk/issues/475)) ([bfb4361](https://github.com/alchemyplatform/aa-sdk/commit/bfb4361481a3b12e7d47096f558921a22aa214ee))
- doc fixes for light account transfer ownership ([#471](https://github.com/alchemyplatform/aa-sdk/issues/471)) ([7b5a6cd](https://github.com/alchemyplatform/aa-sdk/commit/7b5a6cdc4c6909ecb07793aa3c4fa75196b0584a))

# [3.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.13...v3.0.0) (2024-02-21)

### Bug Fixes

- fix doc for light account deployment addresses ([#468](https://github.com/alchemyplatform/aa-sdk/issues/468)) ([41791c4](https://github.com/alchemyplatform/aa-sdk/commit/41791c49bf307136f9d9f6555b3d5b9ceda2d468))
- ma upgrade data was wrong ([#470](https://github.com/alchemyplatform/aa-sdk/issues/470)) ([68d3ceb](https://github.com/alchemyplatform/aa-sdk/commit/68d3ceb9b04f39bb0c328ac3867f66e668555bfc))

### Features

- add a nonce key override to support parallel nonces ([#462](https://github.com/alchemyplatform/aa-sdk/issues/462)) ([d48c586](https://github.com/alchemyplatform/aa-sdk/commit/d48c586665858c61e0d1d66e9bd4503f32e47db9))

# [3.0.0-alpha.13](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.12...v3.0.0-alpha.13) (2024-02-16)

**Note:** Version bump only for package root

# [3.0.0-alpha.12](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.11...v3.0.0-alpha.12) (2024-02-14)

### Bug Fixes

- export the session key ACL type enum ([bd9d75e](https://github.com/alchemyplatform/aa-sdk/commit/bd9d75e0b0b93acdf8e0dce8f461157a0832500b))

# [3.0.0-alpha.11](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2024-02-14)

### Bug Fixes

- session key extension was missing plugin overrides ([#458](https://github.com/alchemyplatform/aa-sdk/issues/458)) ([dc5536c](https://github.com/alchemyplatform/aa-sdk/commit/dc5536c8565de216d0c1ca16d72ca4bfdefe7147))

# [3.0.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2024-02-14)

### Bug Fixes

- update the docs for using a custom account ([#456](https://github.com/alchemyplatform/aa-sdk/issues/456)) ([fb2a541](https://github.com/alchemyplatform/aa-sdk/commit/fb2a5417c19b4f9c335ed86438b7ba81fbb8472d))

# [3.0.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2024-02-13)

### Features

- **amoy:** add amoy from viem update ([#448](https://github.com/alchemyplatform/aa-sdk/issues/448)) ([adae84a](https://github.com/alchemyplatform/aa-sdk/commit/adae84add30536676725dbc8805f3436c8ad395e))

# [3.0.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2024-02-11)

### Features

- add alchemy signer to aa-alchemy ([#441](https://github.com/alchemyplatform/aa-sdk/issues/441)) ([d8b17a7](https://github.com/alchemyplatform/aa-sdk/commit/d8b17a7df54b93c5e79c2034afa99e0bb9c6b637))

# [3.0.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2024-02-10)

**Note:** Version bump only for package root

# [3.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2024-02-08)

### Bug Fixes

- fix broken link for RequestGasAndPaymasterAndDataOverrides ([ce7cb14](https://github.com/alchemyplatform/aa-sdk/commit/ce7cb141013f55cd99df28b660b68f269f26a0ea))
- gasmanager config was being ignored when creating alchemy clients ([25c770f](https://github.com/alchemyplatform/aa-sdk/commit/25c770f5e3d45e9986235d7d7dcc43d8e3610580))
- incorrect entrypoint call ([6e14338](https://github.com/alchemyplatform/aa-sdk/commit/6e143388f68019d5806065fb410927e256bb0259))

### Features

- export the create alchemy client from existing method ([d1c82f8](https://github.com/alchemyplatform/aa-sdk/commit/d1c82f8a1f529f3d098b00fa8b894164eddb665e))

# [3.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2024-02-07)

### Bug Fixes

- **aa-core:** add back eip-1193 method handling to the client ([#425](https://github.com/alchemyplatform/aa-sdk/issues/425)) ([48b5943](https://github.com/alchemyplatform/aa-sdk/commit/48b594375d64fe832cfb06f1fb3a539da3c7b965))

### Features

- add session key extensions for managing keys ([ac86a97](https://github.com/alchemyplatform/aa-sdk/commit/ac86a97cd22004f55fb76ecf13b808a222daf8ef))
- update MSCA multi owner factory, msca, and plugins abis and addresses ([#424](https://github.com/alchemyplatform/aa-sdk/issues/424)) ([9a49ac5](https://github.com/alchemyplatform/aa-sdk/commit/9a49ac53f6a4f30ee36f0e430b033e3a21a7562d))

# [3.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2024-02-02)

### Bug Fixes

- **aa-alchemy:** fix a test that was dependent on the current version ([d4e4a8f](https://github.com/alchemyplatform/aa-sdk/commit/d4e4a8f339f44c552913d4a64a29af85de7da430))
- alchemy package.json was incorrectly pointing to files ([#423](https://github.com/alchemyplatform/aa-sdk/issues/423)) ([5678def](https://github.com/alchemyplatform/aa-sdk/commit/5678defe4885f1b15724e0208a5813deea07ffa4))
- clarify FAQ section ([d9681e5](https://github.com/alchemyplatform/aa-sdk/commit/d9681e5fc485f3b234e2cf26ca4981fe75f9950b))
- some typos in code and change provider -> client in docs ([#422](https://github.com/alchemyplatform/aa-sdk/issues/422)) ([8533744](https://github.com/alchemyplatform/aa-sdk/commit/8533744bda28aff25b3b039d21827ed79a9d36b1))

# [3.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2024-02-02)

### Features

- **aa-alchemy:** add a modular account client function ([323f49e](https://github.com/alchemyplatform/aa-sdk/commit/323f49ecad4fb33991748f168f4ec8da2746ebce))

# [3.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2024-02-01)

### Bug Fixes

- session key permissions builder returning 0x ([7577d8c](https://github.com/alchemyplatform/aa-sdk/commit/7577d8ca570965a8857cc8d301c02f76660e453f))

# [3.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2024-01-31)

### Bug Fixes

- decorators should now correctly respect account hoisting ([86d884e](https://github.com/alchemyplatform/aa-sdk/commit/86d884ed6209d89c688dc4281400f7304b210caa))

# [3.0.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.1...v3.0.0-alpha.0) (2024-01-30)

### Bug Fixes

- add back the alchemy enhanced api actions to alchemy client ([75d1741](https://github.com/alchemyplatform/aa-sdk/commit/75d17411702a0bd8dbae17395af30f19875affb8))
- allow for dynamic setting of the owner on owned accounts ([df333ee](https://github.com/alchemyplatform/aa-sdk/commit/df333eee355effa2f0c051945d283f0f7b3d0449))
- update Alchemy links with affiliate links ([#384](https://github.com/alchemyplatform/aa-sdk/issues/384)) ([b47c61b](https://github.com/alchemyplatform/aa-sdk/commit/b47c61b25326ee65b935de279da43facdd39e70c))

### Code Refactoring

- **aa-alchemy:** migrate aa-alchemy to new viem interfaces ([bf7b49d](https://github.com/alchemyplatform/aa-sdk/commit/bf7b49d631c4d8aaf19a61e98794abd89d87b8e9))
- **aa-core:** complete migration to viem based approach in aa-core ([9bff625](https://github.com/alchemyplatform/aa-sdk/commit/9bff6250d57924e4b1f392601982b9029ed7cbab))
- **aa-ethers:** refactor aa-ethers to use the viem client and accounts ([6cc2051](https://github.com/alchemyplatform/aa-sdk/commit/6cc20518bf90788f83ac3c9e579b0f4f4de518b1))

- refactor(aa-accounts)!: migrate aa-accounts to viem approach ([37a5b48](https://github.com/alchemyplatform/aa-sdk/commit/37a5b489bdd2527dca311787d5585f1dc3a5f05b))

### Features

- hoist account signing methods ([5bcfac8](https://github.com/alchemyplatform/aa-sdk/commit/5bcfac8ddaca6b712d473cbad2cbbd0228827af5))
- update session key plugindef abi and config ([#382](https://github.com/alchemyplatform/aa-sdk/issues/382)) ([a47978e](https://github.com/alchemyplatform/aa-sdk/commit/a47978e66c11504862aeeaa1d4aeb4be37f1f48d))

### BREAKING CHANGES

- **aa-ethers:** aa-ethers has had some functionality removed and apis changed

* inputs to the ProviderAdapter now require a SmartAccountClient
* with\* methods have been removed, middleware config now exists
  on the SmartAccountClient
* the Account Signer has been updated to take a SmartContractAccount
  as input

- all interfaces now use the new smart account
  client and smart account models that match viem more closely
- **aa-alchemy:** all of aa-alchemy now uses viem interfaces in aa-core
- **aa-core:** all interfaces have been migrated to use the new viem style clients and accounts

# [2.4.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.1...v2.4.0) (2024-01-26)

### Features

- update session key plugindef abi and config ([#382](https://github.com/alchemyplatform/aa-sdk/issues/382)) ([a47978e](https://github.com/alchemyplatform/aa-sdk/commit/a47978e66c11504862aeeaa1d4aeb4be37f1f48d))

## [2.3.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.0...v2.3.1) (2024-01-25)

### Bug Fixes

- fix the wrapped signer to work with undeployed accounts ([#381](https://github.com/alchemyplatform/aa-sdk/issues/381)) ([55a3a54](https://github.com/alchemyplatform/aa-sdk/commit/55a3a54b928b7f1f4996f331c6f1c9454a9ac3c8))
- include generated code for new plugin addresses ([e26143e](https://github.com/alchemyplatform/aa-sdk/commit/e26143e217a84bd36c1a7828665fd81d91b73c9f))

# [2.3.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.2.1...v2.3.0) (2024-01-24)

### Bug Fixes

- **buildUserOperationFromTx:** handle the case where no TX has fee fields set ([#378](https://github.com/alchemyplatform/aa-sdk/issues/378)) ([e9eaad1](https://github.com/alchemyplatform/aa-sdk/commit/e9eaad175f9ec14d45b62b2c5bcabb75ca47e74f))
- use the latest multi-owner abis ([#375](https://github.com/alchemyplatform/aa-sdk/issues/375)) ([020f024](https://github.com/alchemyplatform/aa-sdk/commit/020f024bb5f393ea17b8ec3b11abce9fb825f758))

### Features

- make the factory address optional when building MA ([#377](https://github.com/alchemyplatform/aa-sdk/issues/377)) ([05a10b2](https://github.com/alchemyplatform/aa-sdk/commit/05a10b246b28030463ece2a12fc6ed38bdbdd567))

## [2.2.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.2.0...v2.2.1) (2024-01-23)

### Bug Fixes

- **base-provider:** address drop and replace rounding down errors ([#376](https://github.com/alchemyplatform/aa-sdk/issues/376)) ([33b7435](https://github.com/alchemyplatform/aa-sdk/commit/33b74359dedc68ed324697dc32f4f06def1fac59))
- fix a couple of the package.jsons ([#374](https://github.com/alchemyplatform/aa-sdk/issues/374)) ([7abbd93](https://github.com/alchemyplatform/aa-sdk/commit/7abbd9366b9ba12377349e475025aa5edfd73255))

# [2.2.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.1.0...v2.2.0) (2024-01-22)

### Features

- add a factory method for session key accounts ([#369](https://github.com/alchemyplatform/aa-sdk/issues/369)) ([58658ee](https://github.com/alchemyplatform/aa-sdk/commit/58658ee043e767927aa7f031aa2483d4048b964c))
- add a session key signer to use with executor ([#368](https://github.com/alchemyplatform/aa-sdk/issues/368)) ([e35ed3b](https://github.com/alchemyplatform/aa-sdk/commit/e35ed3b6e0965bf46ab2c6d44e9709f5253715c0))
- add session key executor ([#367](https://github.com/alchemyplatform/aa-sdk/issues/367)) ([0da4c76](https://github.com/alchemyplatform/aa-sdk/commit/0da4c76a0ef4ebcb7cab4893b6446be3df79c35e))
- add session key permissions builder for session key plugin ([#366](https://github.com/alchemyplatform/aa-sdk/issues/366)) ([2d7f118](https://github.com/alchemyplatform/aa-sdk/commit/2d7f1182f9f1a36666a2cb06d4a271bab31b1656))
- add usePluginHook to demo app ([#357](https://github.com/alchemyplatform/aa-sdk/issues/357)) ([036b13b](https://github.com/alchemyplatform/aa-sdk/commit/036b13b250b1b3465dee000a6d5036ca060c2bb4))
- extended session key plugin implementation ([#372](https://github.com/alchemyplatform/aa-sdk/issues/372)) ([aca0b03](https://github.com/alchemyplatform/aa-sdk/commit/aca0b0363aae802aa3965568b4f8b8d292ce0cf1))
- implement persistent account state capabilities ([#346](https://github.com/alchemyplatform/aa-sdk/issues/346)) ([710f532](https://github.com/alchemyplatform/aa-sdk/commit/710f532fe6e1b230f4b9e695bb70304e97281d47))
- plugingen to generate plugin contract abi and get contract helper method ([#358](https://github.com/alchemyplatform/aa-sdk/issues/358)) ([87eea72](https://github.com/alchemyplatform/aa-sdk/commit/87eea723901ba0abedbbd1a832a2934a612a9b79))

# [2.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.0.1...v2.1.0) (2024-01-12)

### Bug Fixes

- **light-account:** encode upgrade had a bug in it when upgrading an existing account ([#364](https://github.com/alchemyplatform/aa-sdk/issues/364)) ([55d6c08](https://github.com/alchemyplatform/aa-sdk/commit/55d6c08fbd794f4d0d091c7bf2c1045952a83989))

### Features

- add the ability to generate install functions for plugins ([#361](https://github.com/alchemyplatform/aa-sdk/issues/361)) ([2bf6615](https://github.com/alchemyplatform/aa-sdk/commit/2bf66152f81a979c5a7405593bf3fbf41bc3e52d))

## [2.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.0.0...v2.0.1) (2024-01-12)

**Note:** Version bump only for package root

# [2.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v1.2.4...v2.0.0) (2024-01-12)

### Bug Fixes

- **msca:** support multiple owners during intialization ([#355](https://github.com/alchemyplatform/aa-sdk/issues/355)) ([f8bd650](https://github.com/alchemyplatform/aa-sdk/commit/f8bd65073c7bdec5c3b32ce9f1938b3bfd587ded))
- **publish:** remove added stuff ([2be5f83](https://github.com/alchemyplatform/aa-sdk/commit/2be5f8325e9b58e83fd7e94148646c40aa77f65f))

- feat!: update the LightAccount logic for 1271 signatures to match the on-chain impl ([bbe5060](https://github.com/alchemyplatform/aa-sdk/commit/bbe5060c01828e07d7f788485b14c04dacc6cb6f))

### Features

- add upgrade functionality for light account to msca ([#298](https://github.com/alchemyplatform/aa-sdk/issues/298)) ([18f51d9](https://github.com/alchemyplatform/aa-sdk/commit/18f51d9f626b48390a54d88b7ac28c1f162e04f8))
- update zod to allow custom viem chains in core ([#348](https://github.com/alchemyplatform/aa-sdk/issues/348)) ([291f73f](https://github.com/alchemyplatform/aa-sdk/commit/291f73f50e2e6fa382d269b8568b6255bcad4b0c))

### BREAKING CHANGES

- default LightAccountFactory address has changed

## 1.2.4 (2024-01-08)

**Note:** Version bump only for package root

## 1.2.3 (2023-12-22)

### Features

- add stringToIndex util function for SmartAccount salt ([#329](https://github.com/alchemyplatform/aa-sdk/issues/329)) ([b34ef9a](https://github.com/alchemyplatform/aa-sdk/commit/b34ef9aa6727986e89a1461dec45955cac9d4365))
- add prefix for aa-signers signer type ([#325](https://github.com/alchemyplatform/aa-sdk/issues/325)) ([f3b8cc1](https://github.com/alchemyplatform/aa-sdk/commit/f3b8cc1f0553bad51e4f95c3fd80f6aa0199cff2))
- add terms page to glossary ([#336](https://github.com/alchemyplatform/aa-sdk/issues/336)) ([63b24ec](https://github.com/alchemyplatform/aa-sdk/commit/63b24ecdb3e5e656c173a1523a3e09478d4c074d))
- add faq page to docs ([#335](https://github.com/alchemyplatform/aa-sdk/issues/335)) ([63092ce](https://github.com/alchemyplatform/aa-sdk/commit/63092ceb45341d422bd3f8c13ebcc539d9cc5001))
- add aa-signer implementation for lit protocol ([#312](https://github.com/alchemyplatform/aa-sdk/issues/312)) ([b0f8dd5](https://github.com/alchemyplatform/aa-sdk/commit/b0f8dd538728f8a7dd4447da8c88a50179d61f95))
- add aa-signer implementation for arcana auth ([#319](https://github.com/alchemyplatform/aa-sdk/issues/319)) ([c82dbf7](https://github.com/alchemyplatform/aa-sdk/commit/c82dbf7ad76791e81525740dfe8820bd234c2863))
- add types to glossary ([#338](https://github.com/alchemyplatform/aa-sdk/issues/338)) ([28ad2b0](https://github.com/alchemyplatform/aa-sdk/commit/28ad2b015e5d0191f77cbdeeb3c071b7ec813fde))

## 1.2.2 (2023-12-13)

### Bug Fixes

- fix the named export for web3auth ([#330](https://github.com/alchemyplatform/aa-sdk/issues/330)) ([b340f11](https://github.com/alchemyplatform/aa-sdk/commit/b340f115e96ab068f70f8b5ff8316f4724b3ab6d))

## 1.2.1 (2023-12-12)

### Features

- allow passing raw call data to sendUserOperation ([#272](https://github.com/alchemyplatform/aa-sdk/issues/272) ([26b90b6](https://github.com/alchemyplatform/aa-sdk/commit/26b90b63a998b106130f3c671bb77f977becb45d)))
- add aa-signers package ([#228](https://github.com/alchemyplatform/aa-sdk/issues/228)) ([5fcd322](https://github.com/alchemyplatform/aa-sdk/commit/5fcd3222133205e5b3f86b456309584d848b1fb5))
- add aa-signer implementation for magic ([#229](https://github.com/alchemyplatform/aa-sdk/issues/229)) ([860d177](https://github.com/alchemyplatform/aa-sdk/commit/860d17778f6ffc6140d07f2fce147eb8993ee985))
- add aa-signer implementation for web3auth ([#247](https://github.com/alchemyplatform/aa-sdk/issues/247)) ([7d0492b](https://github.com/alchemyplatform/aa-sdk/commit/7d0492b3829b07d18c1488b7d7e0b129e40f7b4c))
- add aa-signer implementation for turnkey ([#307](https://github.com/alchemyplatform/aa-sdk/issues/307)) ([4fa05e4](https://github.com/alchemyplatform/aa-sdk/commit/4fa05e4ada8c6558e3ce0bd35b157110baba47c9))
- add aa-signer implementation for fireblocks ([#301](https://github.com/alchemyplatform/aa-sdk/issues/301)) ([40289e6](https://github.com/alchemyplatform/aa-sdk/commit/40289e6c656344ab0cd6c60e6dbc7c11d392d27e))
- add aa-signer implementation for particle ([#304](https://github.com/alchemyplatform/aa-sdk/issues/304)) ([e049c2c](https://github.com/alchemyplatform/aa-sdk/commit/e049c2caa562089f62614549ac4e7b2c741f93fd))
- add aa-signer implementation for portal ([#303](https://github.com/alchemyplatform/aa-sdk/issues/303)) ([eb8a0c3](https://github.com/alchemyplatform/aa-sdk/commit/eb8a0c356ba89701d9cc34921cf7812c23791655))
- add aa-signer implementation for capsule ([#305](https://github.com/alchemyplatform/aa-sdk/issues/305)) ([9d89e99](https://github.com/alchemyplatform/aa-sdk/commit/9d89e99aea12fc4c13f5b4a680167d5687829bfe))
- add improvements on provider for override user operation fee and gas ([#277](https://github.com/alchemyplatform/aa-sdk/issues/277)) ([258d80e](https://github.com/alchemyplatform/aa-sdk/commit/258d80e64d7aaa7de26f72375b9d58221c95311e))
- support one-off percentage overrides for user operations ([#289](https://github.com/alchemyplatform/aa-sdk/issues/289)) ([dc979ff](https://github.com/alchemyplatform/aa-sdk/commit/dc979ff111f0a490b08adce9a913466706399afb))
- add a convenience method to make creating an alchemy provider easier ([#206](https://github.com/alchemyplatform/aa-sdk/issues/206)) ([211b7e0](https://github.com/alchemyplatform/aa-sdk/commit/211b7e0e715b961520dc5baaa4f0d49b647fbd79))
- add nani smart account implementation ([#306](https://github.com/alchemyplatform/aa-sdk/issues/306)) ([bf7566f](https://github.com/alchemyplatform/aa-sdk/commit/bf7566f2d62ab7ca4ee7fcb4a9df68308fbe5622))
- improve zod validation parsing ([#299](https://github.com/alchemyplatform/aa-sdk/issues/299)) ([0763a82](https://github.com/alchemyplatform/aa-sdk/commit/0763a82d47f491513bdcf75716c83043f3dbd2be))
- docs site re-formatting ([#300](https://github.com/alchemyplatform/aa-sdk/issues/300)) ([a1376c4](https://github.com/alchemyplatform/aa-sdk/commit/a1376c4ad38a62517092ebdd8c87557712c4aecc))
- docs for Dfns Signer ([#313](https://github.com/alchemyplatform/aa-sdk/issues/313)) ([33141b0](https://github.com/alchemyplatform/aa-sdk/commit/33141b08759b89e2c10f56d95a1316098f67fb9c))
- docs for Arcana Signer ([#318](https://github.com/alchemyplatform/aa-sdk/issues/318)) ([81711d6](https://github.com/alchemyplatform/aa-sdk/commit/81711d6565a089a15eba95bc54c55972b13457e8))

# 1.2.0 (2023-11-17)

### Features

- make alchemy-sdk an optional dependency on aa-alchemy ([#265](https://github.com/alchemyplatform/aa-sdk/issues/265)) ([a0088b3](https://github.com/alchemyplatform/aa-sdk/commit/a0088b3ecce191ece21f4082a73c4fcae0e2286c))

# 1.1.0 (2023-11-14)

### Features

- merge development into main for new minor release ([#251](https://github.com/alchemyplatform/aa-sdk/issues/251)) ([ab098ee](https://github.com/alchemyplatform/aa-sdk/commit/ab098ee9ec35e4b1b3c788046168874fb51e4783))

# [1.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.2.0...v1.0.0) (2023-11-10)

### Features

- aa-sdk with native arb sepolia support ([#231](https://github.com/alchemyplatform/aa-sdk/issues/231)) ([7580608](https://github.com/alchemyplatform/aa-sdk/commit/7580608623961155290a3010fb784a14aecd82af))
- add sanity check on provider connect for clearer error message ([#181](https://github.com/alchemyplatform/aa-sdk/issues/181)) ([1739f13](https://github.com/alchemyplatform/aa-sdk/commit/1739f13981bf2289de5669b871843fd48ae3eb58))
- add sanity check on provider connect for clearer error message ([#181](https://github.com/alchemyplatform/aa-sdk/issues/181)) ([490235a](https://github.com/alchemyplatform/aa-sdk/commit/490235af0066f2cb18b2c0abba294fc968a1cee3))
- add support for overriding the initCode for an account ([#197](https://github.com/alchemyplatform/aa-sdk/issues/197)) ([a886853](https://github.com/alchemyplatform/aa-sdk/commit/a886853ce5628f7e252750f52d8ad8c38eeef0c0))
- add zod runtime validation for base account ([#186](https://github.com/alchemyplatform/aa-sdk/issues/186)) ([ea85c96](https://github.com/alchemyplatform/aa-sdk/commit/ea85c961ee0140bf12151984324e4b2e7ed86d6a))
- add zod runtime validation for base provider ([#171](https://github.com/alchemyplatform/aa-sdk/issues/171)) ([3032d23](https://github.com/alchemyplatform/aa-sdk/commit/3032d23744f73f703be2b79fae3b6b9ef93dcb5b))
- add zod runtime validation for simple account ([#189](https://github.com/alchemyplatform/aa-sdk/issues/189)) ([f14016f](https://github.com/alchemyplatform/aa-sdk/commit/f14016f38777f1e629c1aaaaf16f81881ee5d7c9))
- **arb-sepolia:** add arb sepolia to defaults ([#216](https://github.com/alchemyplatform/aa-sdk/issues/216)) ([9229fb5](https://github.com/alchemyplatform/aa-sdk/commit/9229fb529c479ca72d305da9452ad1456be2bc6e))
- choosing your signer, light account, modular account doc update ([#215](https://github.com/alchemyplatform/aa-sdk/issues/215)) ([f05b92d](https://github.com/alchemyplatform/aa-sdk/commit/f05b92d1ecd7465a495c97bea692d38e11c6c1ae))
- docs site formatting styling ([#217](https://github.com/alchemyplatform/aa-sdk/issues/217)) ([9815c9c](https://github.com/alchemyplatform/aa-sdk/commit/9815c9cb512591419e79570dc0d97c7dcf394fa3))
- entry point address as optional to SmartAccountProvider ([#180](https://github.com/alchemyplatform/aa-sdk/issues/180)) ([4b62df0](https://github.com/alchemyplatform/aa-sdk/commit/4b62df069071d6e0bcaa533b146ecba5baa6d6d8))
- entry point address as optional to SmartAccountProvider ([#180](https://github.com/alchemyplatform/aa-sdk/issues/180)) ([f5c378b](https://github.com/alchemyplatform/aa-sdk/commit/f5c378ba1cb04bdc1e41c3e6dd0eba1cb6ee7f2c))
- light account doc update ([#219](https://github.com/alchemyplatform/aa-sdk/issues/219)) ([2e30c92](https://github.com/alchemyplatform/aa-sdk/commit/2e30c922f58de77f543b7f080750444efe17c6c1))
- make entry point contract as an optional param to SCA class ([#182](https://github.com/alchemyplatform/aa-sdk/issues/182)) ([14019a4](https://github.com/alchemyplatform/aa-sdk/commit/14019a4b1dbd193158cd66a1e846d589f19a6670))
- remove AA_SDK_TESTS_SIGNER_TYPE constant exported from aa-core ([#232](https://github.com/alchemyplatform/aa-sdk/issues/232)) ([883c489](https://github.com/alchemyplatform/aa-sdk/commit/883c489b077d587b6c5b50c44d92b2a00f10e5ac))
- **sepolia:** add min priority per bid ([#214](https://github.com/alchemyplatform/aa-sdk/issues/214)) ([075503e](https://github.com/alchemyplatform/aa-sdk/commit/075503e2b861c84838c115a7edb8e60ad38aec09))
- support enhanced apis in alchemy provider ([#221](https://github.com/alchemyplatform/aa-sdk/issues/221)) ([83ea17f](https://github.com/alchemyplatform/aa-sdk/commit/83ea17f9c69123d9282871b6f3bb02ff64750625))
- use alchemy provider, light account for e2e tests ([#209](https://github.com/alchemyplatform/aa-sdk/issues/209)) ([124be68](https://github.com/alchemyplatform/aa-sdk/commit/124be68c5137a3511ec612e814265739e6909e75))

# 0.2.0 (2023-11-03)

### Features

- merge development into main for new version release ([#207](https://github.com/alchemyplatform/aa-sdk/issues/207)) ([f06fd2a](https://github.com/alchemyplatform/aa-sdk/commit/f06fd2adf5e4aaf90214435d32f9d566d8502099))

## 0.1.1 (2023-10-20)

### Bug Fixes

- bad deploy script again ([2da8de2](https://github.com/alchemyplatform/aa-sdk/commit/2da8de2f4feb4c82fd454050e66f6203b61bcc2c))

# [0.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.32...v0.1.0) (2023-10-10)

### Bug Fixes

- general improvements to the examples section ([#111](https://github.com/alchemyplatform/aa-sdk/issues/111)) ([78e4050](https://github.com/alchemyplatform/aa-sdk/commit/78e4050e19d823e942ac893c54629360292299cd))
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

**Note:** Version bump only for package root

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

**Note:** Version bump only for package root

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

**Note:** Version bump only for package root

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

### Features

- add a logger and some debug statements ([#35](https://github.com/alchemyplatform/aa-sdk/issues/35)) ([faef24e](https://github.com/alchemyplatform/aa-sdk/commit/faef24e9060216b03b4c7f2413d7fde931046096))

# [0.1.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.10) (2023-06-26)

### Bug Fixes

- types changed when updating to latest viem ([0aec96d](https://github.com/alchemyplatform/aa-sdk/commit/0aec96d184b5bcc3787ce9123260cf287f27f037))

# [0.1.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.8...v0.1.0-alpha.9) (2023-06-26)

**Note:** Version bump only for package root

# [0.1.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.7...v0.1.0-alpha.8) (2023-06-23)

### Bug Fixes

- **alchemy:** add opt mainnet to dummy gen ([#34](https://github.com/alchemyplatform/aa-sdk/issues/34)) ([ef21ad5](https://github.com/alchemyplatform/aa-sdk/commit/ef21ad514f9c1dfdfb49dedfd39586f58c2976c1))

# [0.1.0-alpha.7](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.6...v0.1.0-alpha.7) (2023-06-20)

**Note:** Version bump only for package root

# [0.1.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.5...v0.1.0-alpha.6) (2023-06-19)

### Bug Fixes

- return scaled prio fee as max fee per gas ([#27](https://github.com/alchemyplatform/aa-sdk/issues/27)) ([56bc34b](https://github.com/alchemyplatform/aa-sdk/commit/56bc34be3a50a2709ca546ed90a980f3c489cbbe))

# [0.1.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.4...v0.1.0-alpha.5) (2023-06-16)

**Note:** Version bump only for package root

# [0.1.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2023-06-14)

### Features

- add aa-accounts subpackage ([#23](https://github.com/alchemyplatform/aa-sdk/issues/23)) ([a7fd5da](https://github.com/alchemyplatform/aa-sdk/commit/a7fd5da8600b0a346627df3a4b5cc338210aa256))
- expose more user op methods on the provider ([#25](https://github.com/alchemyplatform/aa-sdk/issues/25)) ([2f39460](https://github.com/alchemyplatform/aa-sdk/commit/2f3946063d78a4fe1a99078f8fd315d87b24a901))

# [0.1.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2023-06-13)

### Bug Fixes

- imports are broken because missing .js extension ([98f4a54](https://github.com/alchemyplatform/aa-sdk/commit/98f4a5469b0ac01a833ede08c6c077373255ed22))

# [0.1.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2023-06-12)

### Bug Fixes

- arbitrum min fee per bid needs to be a 1/10th the default on other chains ([#17](https://github.com/alchemyplatform/aa-sdk/issues/17)) ([453ecec](https://github.com/alchemyplatform/aa-sdk/commit/453ececb22e1981b27ed0635e0c763aa73e1a36f))
- fix broken deploy by ignoring example dapp build ([cadd788](https://github.com/alchemyplatform/aa-sdk/commit/cadd78813c01f33d2fe1e66140275bd9dd232699))
- import in core was still exporting deleted item ([4946408](https://github.com/alchemyplatform/aa-sdk/commit/4946408e757eab4e18a96d0a16839e92d78238d4))
- inject version was not using double quotes ([b7a7700](https://github.com/alchemyplatform/aa-sdk/commit/b7a77005bc0b04904911285ee0a9d3b610a73b89))

### Features

- add alchemy sub-package ([#22](https://github.com/alchemyplatform/aa-sdk/issues/22)) ([e7fc1aa](https://github.com/alchemyplatform/aa-sdk/commit/e7fc1aa93ebd57237009d3aa688d8c167f240aad))
- Add polygon mainnet support and fix wallet signature issue ([#13](https://github.com/alchemyplatform/aa-sdk/issues/13)) ([a67970a](https://github.com/alchemyplatform/aa-sdk/commit/a67970a07900be1d9efa0640f03c7feae3768360))
- add smart contract for nft for onboarding ([#10](https://github.com/alchemyplatform/aa-sdk/issues/10)) ([e3dc165](https://github.com/alchemyplatform/aa-sdk/commit/e3dc165bc53fcfa7d8d3e42e99d0c7cf8ff405b5))
- clean up components for profile and nft fetching ([#9](https://github.com/alchemyplatform/aa-sdk/issues/9)) ([e53ab62](https://github.com/alchemyplatform/aa-sdk/commit/e53ab6204f67a09860b640531ec9c8a66bb2917f))
- create Example Directory and Example Node.js D(AA)pp ([#8](https://github.com/alchemyplatform/aa-sdk/issues/8)) ([34b77d9](https://github.com/alchemyplatform/aa-sdk/commit/34b77d9e2fce3ae334037c67c72a330c755be606))
- integrate sdk + nft contract for onboarding ([#11](https://github.com/alchemyplatform/aa-sdk/issues/11)) ([f50b0e7](https://github.com/alchemyplatform/aa-sdk/commit/f50b0e783f838e313a12e1c0b65e5bd6a1e5040d))
- integrate sdk and refactor onboarding ([#12](https://github.com/alchemyplatform/aa-sdk/issues/12)) ([7dd7c97](https://github.com/alchemyplatform/aa-sdk/commit/7dd7c97ad10936fec0c9171d93745a891674c409))
- Support Arb Mainnet for Demo App ([#18](https://github.com/alchemyplatform/aa-sdk/issues/18)) ([6df907c](https://github.com/alchemyplatform/aa-sdk/commit/6df907cf8acb0fcf921b700a18d5bcb6d89c49f3))

# [0.1.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2023-06-02)

### Features

- add support for the new alchemy paymaster endpoint ([#14](https://github.com/alchemyplatform/aa-sdk/issues/14)) ([3fac515](https://github.com/alchemyplatform/aa-sdk/commit/3fac5152075b07ab91dea393e366b667149a3e23))

# [0.1.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.2...v0.1.0-alpha.0) (2023-05-31)

### Features

- add support for batching transactions in a userop ([#7](https://github.com/alchemyplatform/aa-sdk/issues/7)) ([79d63a7](https://github.com/alchemyplatform/aa-sdk/commit/79d63a79d26d6501d74dbf90de6c9a1158d931de))

## [0.0.1-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.1...v0.0.1-alpha.2) (2023-05-23)

**Note:** Version bump only for package root

## [0.0.1-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v0.0.1-alpha.0...v0.0.1-alpha.1) (2023-05-22)

**Note:** Version bump only for package root

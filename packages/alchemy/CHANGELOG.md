# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.17.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.17.1...v3.17.2) (2024-05-31)

### Reverts

- undo vocs deploy ([#690](https://github.com/alchemyplatform/aa-sdk/issues/690)) ([c7cb350](https://github.com/alchemyplatform/aa-sdk/commit/c7cb350f9786fe10d03c62d61a8d2c9f21d4cdc0))

## [3.17.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.17.0...v3.17.1) (2024-05-31)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.17.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.16.2...v3.17.0) (2024-05-29)

### Bug Fixes

- **createAccount:** possible uncaught undefined ([e275f5f](https://github.com/alchemyplatform/aa-sdk/commit/e275f5f5edc313ff88aa46a2336fc8cfaab6ca65))
- export the \*web client and signer in aa-alchemy ([0777b97](https://github.com/alchemyplatform/aa-sdk/commit/0777b97b9a2620be02fffe92e3e46fe6162bae49))

## [3.16.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.16.1...v3.16.2) (2024-05-26)

### Bug Fixes

- **hydrate:** unhandled undefined case in hydrating account state ([175eaee](https://github.com/alchemyplatform/aa-sdk/commit/175eaee8575b1a0c23c5499f03f883ded64efed6))

## [3.16.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.16.0...v3.16.1) (2024-05-23)

### Bug Fixes

- **alchemy-signer:** fix the sign tx method to return the full tx ([#678](https://github.com/alchemyplatform/aa-sdk/issues/678)) ([86e3c99](https://github.com/alchemyplatform/aa-sdk/commit/86e3c99260a21cd5339d586643be60e3dafefabe))

# [3.16.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.15.0...v3.16.0) (2024-05-22)

### Features

- add EOA support ([#667](https://github.com/alchemyplatform/aa-sdk/issues/667)) ([bc1582a](https://github.com/alchemyplatform/aa-sdk/commit/bc1582afc4aa3cd411573a73ef2a9be6ee0ff247))

# [3.15.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.14.1...v3.15.0) (2024-05-20)

### Bug Fixes

- account state was not syncing across chain changes ([#672](https://github.com/alchemyplatform/aa-sdk/issues/672)) ([c4e47d5](https://github.com/alchemyplatform/aa-sdk/commit/c4e47d5d97d26c4bfb5922a45181f4138eb9dc9c))

### Features

- allow setting gas manager config in the config ([#670](https://github.com/alchemyplatform/aa-sdk/issues/670)) ([38dfa25](https://github.com/alchemyplatform/aa-sdk/commit/38dfa2578e1dccdedca5295b2c2871bafa1aef7c))

## [3.14.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.14.0...v3.14.1) (2024-05-17)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.14.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.13.1...v3.14.0) (2024-05-17)

### Bug Fixes

- **aa-alchemy/config:** export missing actions ([175dc20](https://github.com/alchemyplatform/aa-sdk/commit/175dc200404373686f1654ff72404edd04c31cbd))

### Features

- add multi-chain support to account configs ([#666](https://github.com/alchemyplatform/aa-sdk/issues/666)) ([60994e9](https://github.com/alchemyplatform/aa-sdk/commit/60994e983a93bff97400a565dd755a2e8dab2655))

## [3.13.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.13.0...v3.13.1) (2024-05-14)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.13.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.4...v3.13.0) (2024-05-10)

### Features

- add email loading state to the modal ([8d0d244](https://github.com/alchemyplatform/aa-sdk/commit/8d0d24408652cbc48ea4cd44ed0c98c1cb68d2f8))
- add passkey loading state ([b56fe8d](https://github.com/alchemyplatform/aa-sdk/commit/b56fe8d240e58392b15f6a58d79fe580f8118772))
- add support for adding a passkey on signup ([ab6bad3](https://github.com/alchemyplatform/aa-sdk/commit/ab6bad3a24bd8736e1fbe15881f4b156492b2dae))
- **ui:** start adding use authenticate calls to the modal ([c2ef8eb](https://github.com/alchemyplatform/aa-sdk/commit/c2ef8ebf437226c41e05bc310b9a7b39459c94c1))

## [3.12.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.3...v3.12.4) (2024-05-10)

### Bug Fixes

- alchemy paymaster 0x override was not awaiting gas estimates ([#660](https://github.com/alchemyplatform/aa-sdk/issues/660)) ([51d31ff](https://github.com/alchemyplatform/aa-sdk/commit/51d31fff352472ea3f2564f87620d217f9bb2b85))

## [3.12.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.2...v3.12.3) (2024-05-10)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [3.12.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.1...v3.12.2) (2024-05-09)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [3.12.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.12.0...v3.12.1) (2024-05-07)

### Bug Fixes

- **alchemy:** remove typescript-cookie because its not cjs compatible ([#652](https://github.com/alchemyplatform/aa-sdk/issues/652)) ([21eeb63](https://github.com/alchemyplatform/aa-sdk/commit/21eeb6373bd11b7bf149ae12dce3c045abefd8e3))
- replace fraxTestnet with fraxSepolia ([#642](https://github.com/alchemyplatform/aa-sdk/issues/642)) ([320a15d](https://github.com/alchemyplatform/aa-sdk/commit/320a15d049e9ad6125e9e4102a3fc1ebe8f0dd55))

# [3.12.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.11.1...v3.12.0) (2024-05-02)

### Features

- add form input stylings ([76e961a](https://github.com/alchemyplatform/aa-sdk/commit/76e961af5f90db2c3c502d244ab16b007d4e0542))
- prototype the auth modal hook ([#638](https://github.com/alchemyplatform/aa-sdk/issues/638)) ([ebed224](https://github.com/alchemyplatform/aa-sdk/commit/ebed22421c352e0be20f9c28e6aa77abb6ee1e98))
- start adding the ui component engine ([7368385](https://github.com/alchemyplatform/aa-sdk/commit/736838540b9cd6b5a05c1ee3934e08dc5f7f6fb7))

## [3.11.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.11.0...v3.11.1) (2024-04-30)

### Bug Fixes

- make multisig e2e tests pass ([#615](https://github.com/alchemyplatform/aa-sdk/issues/615)) ([08cf8d8](https://github.com/alchemyplatform/aa-sdk/commit/08cf8d81b3afd7b06c51a3b9fe6a0ee5a0a91d44))

# [3.11.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.10.0...v3.11.0) (2024-04-30)

**Note:** Version bump only for package @alchemy/aa-alchemy

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

### Features

- add useAddPasskey hook ([#565](https://github.com/alchemyplatform/aa-sdk/issues/565)) ([27b3bde](https://github.com/alchemyplatform/aa-sdk/commit/27b3bde8b9593055f213f15fbefe07e3a010bd60))
- **entrypoint-0.7:** base - all changes in regards to the EntryPoint v6 & v7 support ([#514](https://github.com/alchemyplatform/aa-sdk/issues/514)) ([6cc692e](https://github.com/alchemyplatform/aa-sdk/commit/6cc692edf2ac20adf310b7a0efd99879b6e6f485)), closes [#549](https://github.com/alchemyplatform/aa-sdk/issues/549)
- light account v2 entrypoint v7 and multi owner update ([#548](https://github.com/alchemyplatform/aa-sdk/issues/548)) ([5f2f5c9](https://github.com/alchemyplatform/aa-sdk/commit/5f2f5c963ecdeb8c7efadb6eda2f2e9e6187f636))
- paymaster middleware update per entrypoint v7 user operation ([#580](https://github.com/alchemyplatform/aa-sdk/issues/580)) ([399479a](https://github.com/alchemyplatform/aa-sdk/commit/399479a38d6eaf0ab6d4d46b38f9d0f5a773cbed))

## [3.8.2-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.1...v3.8.2-alpha.0) (2024-04-17)

### Features

- **entrypoint-0.7:** base - all changes in regards to the EntryPoint v6 & v7 support ([#514](https://github.com/alchemyplatform/aa-sdk/issues/514)) ([6cc692e](https://github.com/alchemyplatform/aa-sdk/commit/6cc692edf2ac20adf310b7a0efd99879b6e6f485)), closes [#549](https://github.com/alchemyplatform/aa-sdk/issues/549)
- light account v2 entrypoint v7 and multi owner update ([#548](https://github.com/alchemyplatform/aa-sdk/issues/548)) ([5f2f5c9](https://github.com/alchemyplatform/aa-sdk/commit/5f2f5c963ecdeb8c7efadb6eda2f2e9e6187f636))
- paymaster middleware update per entrypoint v7 user operation ([1709533](https://github.com/alchemyplatform/aa-sdk/commit/1709533ba9cd227e2c3c7c9cb848f921bde353f4))

## [3.8.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.8.0...v3.8.1) (2024-04-11)

### Bug Fixes

- add the signer header when using aa-alchemy ([#563](https://github.com/alchemyplatform/aa-sdk/issues/563)) ([7cfeaa6](https://github.com/alchemyplatform/aa-sdk/commit/7cfeaa6f093f929f59f1055fc16e07840bf487a0))
- **alchemy:** fix the gas manager middleware to leave fees and gas unset ([#572](https://github.com/alchemyplatform/aa-sdk/issues/572)) ([463e481](https://github.com/alchemyplatform/aa-sdk/commit/463e48140d385962b2ba0795795600cd657da62c))

# [3.8.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.3...v3.8.0) (2024-04-10)

### Features

- add alchemy accounts context ([#539](https://github.com/alchemyplatform/aa-sdk/issues/539)) ([f92469e](https://github.com/alchemyplatform/aa-sdk/commit/f92469ee3f1a5bc3e9f8fe72d6067de1f28e24dd)), closes [#561](https://github.com/alchemyplatform/aa-sdk/issues/561)
- **alchemy-signer:** emit events from the alchemy signer on state changes ([#523](https://github.com/alchemyplatform/aa-sdk/issues/523)) ([8880e6d](https://github.com/alchemyplatform/aa-sdk/commit/8880e6d5bb9c98524c726a841fab5019bd6f0049))
- **multi-sig:** add multisig plugin ([#519](https://github.com/alchemyplatform/aa-sdk/issues/519)) ([0139ef6](https://github.com/alchemyplatform/aa-sdk/commit/0139ef6de9b593dbe239675485a531122da254c4)), closes [#536](https://github.com/alchemyplatform/aa-sdk/issues/536)

## [3.7.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.2...v3.7.3) (2024-03-28)

### Bug Fixes

- **alchemy-signer:** fix the passkey creation flow ([#534](https://github.com/alchemyplatform/aa-sdk/issues/534)) ([ef50ac4](https://github.com/alchemyplatform/aa-sdk/commit/ef50ac4def125270a99d73402d6f8903dbbf97d6))

## [3.7.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.1...v3.7.2) (2024-03-27)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [3.7.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.7.0...v3.7.1) (2024-03-27)

### Bug Fixes

- dummy paymaster and data addresses updates ([#532](https://github.com/alchemyplatform/aa-sdk/issues/532)) ([baab7bd](https://github.com/alchemyplatform/aa-sdk/commit/baab7bd7500157af744fe1c581ac12cbe2e0d8b2))

# [3.7.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.6.1...v3.7.0) (2024-03-27)

### Features

- update dummy paymaster and data ([#531](https://github.com/alchemyplatform/aa-sdk/issues/531)) ([956873b](https://github.com/alchemyplatform/aa-sdk/commit/956873b768afa63747aacfb6252e5ac3b4655f65))

## [3.6.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.6.0...v3.6.1) (2024-03-18)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.6.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.5.1...v3.6.0) (2024-03-18)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [3.5.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.5.0...v3.5.1) (2024-03-14)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.5.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.4.4...v3.5.0) (2024-03-14)

### Bug Fixes

- **alchemy-signer:** check if process is defined before reading env vars ([#508](https://github.com/alchemyplatform/aa-sdk/issues/508)) ([bce8123](https://github.com/alchemyplatform/aa-sdk/commit/bce81239457c05bf1ee3560513bf6c140167ad04))

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

# [3.3.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.2.1...v3.3.0) (2024-02-29)

### Features

- **alchemy-signer:** migrate the alchemy signer to use bundle from QP ([#492](https://github.com/alchemyplatform/aa-sdk/issues/492)) ([cd6f491](https://github.com/alchemyplatform/aa-sdk/commit/cd6f491ffb66de3924024420e76e5350f831497c))

## [3.2.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.2.0...v3.2.1) (2024-02-27)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.2.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.2...v3.2.0) (2024-02-26)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [3.1.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.1...v3.1.2) (2024-02-26)

### Bug Fixes

- **alchemy-signer:** missing transports on iOS during passkey creation ([#488](https://github.com/alchemyplatform/aa-sdk/issues/488)) ([740946f](https://github.com/alchemyplatform/aa-sdk/commit/740946f14f5a67b986e136269c564f79811f5d23))

## [3.1.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.1.0...v3.1.1) (2024-02-23)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.1...v3.1.0) (2024-02-23)

### Bug Fixes

- tx signing needs to happen over hash of RLP ([#481](https://github.com/alchemyplatform/aa-sdk/issues/481)) ([e3d7371](https://github.com/alchemyplatform/aa-sdk/commit/e3d737175abab6f4ccb16e4e22e0ec4f58c4e736))

### Features

- support using AlchemySigner as EOA ([#467](https://github.com/alchemyplatform/aa-sdk/issues/467)) ([b620671](https://github.com/alchemyplatform/aa-sdk/commit/b6206717afb51267a406a6d2fd48af5593888fdf))

## [3.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0...v3.0.1) (2024-02-21)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.13...v3.0.0) (2024-02-21)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.0.0-alpha.13](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.12...v3.0.0-alpha.13) (2024-02-16)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.0.0-alpha.10](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2024-02-14)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.0.0-alpha.9](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2024-02-13)

### Features

- **amoy:** add amoy from viem update ([#448](https://github.com/alchemyplatform/aa-sdk/issues/448)) ([adae84a](https://github.com/alchemyplatform/aa-sdk/commit/adae84add30536676725dbc8805f3436c8ad395e))

# [3.0.0-alpha.8](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2024-02-11)

### Features

- add alchemy signer to aa-alchemy ([#441](https://github.com/alchemyplatform/aa-sdk/issues/441)) ([d8b17a7](https://github.com/alchemyplatform/aa-sdk/commit/d8b17a7df54b93c5e79c2034afa99e0bb9c6b637))

# [3.0.0-alpha.6](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2024-02-08)

### Bug Fixes

- gasmanager config was being ignored when creating alchemy clients ([25c770f](https://github.com/alchemyplatform/aa-sdk/commit/25c770f5e3d45e9986235d7d7dcc43d8e3610580))
- incorrect entrypoint call ([6e14338](https://github.com/alchemyplatform/aa-sdk/commit/6e143388f68019d5806065fb410927e256bb0259))

### Features

- export the create alchemy client from existing method ([d1c82f8](https://github.com/alchemyplatform/aa-sdk/commit/d1c82f8a1f529f3d098b00fa8b894164eddb665e))

# [3.0.0-alpha.5](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2024-02-07)

### Bug Fixes

- **aa-core:** add back eip-1193 method handling to the client ([#425](https://github.com/alchemyplatform/aa-sdk/issues/425)) ([48b5943](https://github.com/alchemyplatform/aa-sdk/commit/48b594375d64fe832cfb06f1fb3a539da3c7b965))

# [3.0.0-alpha.4](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2024-02-02)

### Bug Fixes

- **aa-alchemy:** fix a test that was dependent on the current version ([d4e4a8f](https://github.com/alchemyplatform/aa-sdk/commit/d4e4a8f339f44c552913d4a64a29af85de7da430))
- alchemy package.json was incorrectly pointing to files ([#423](https://github.com/alchemyplatform/aa-sdk/issues/423)) ([5678def](https://github.com/alchemyplatform/aa-sdk/commit/5678defe4885f1b15724e0208a5813deea07ffa4))

# [3.0.0-alpha.3](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2024-02-02)

### Features

- **aa-alchemy:** add a modular account client function ([323f49e](https://github.com/alchemyplatform/aa-sdk/commit/323f49ecad4fb33991748f168f4ec8da2746ebce))

# [3.0.0-alpha.2](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2024-02-01)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [3.0.0-alpha.1](https://github.com/alchemyplatform/aa-sdk/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2024-01-31)

### Bug Fixes

- decorators should now correctly respect account hoisting ([86d884e](https://github.com/alchemyplatform/aa-sdk/commit/86d884ed6209d89c688dc4281400f7304b210caa))

# [3.0.0-alpha.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.1...v3.0.0-alpha.0) (2024-01-30)

### Bug Fixes

- add back the alchemy enhanced api actions to alchemy client ([75d1741](https://github.com/alchemyplatform/aa-sdk/commit/75d17411702a0bd8dbae17395af30f19875affb8))

### Code Refactoring

- **aa-alchemy:** migrate aa-alchemy to new viem interfaces ([bf7b49d](https://github.com/alchemyplatform/aa-sdk/commit/bf7b49d631c4d8aaf19a61e98794abd89d87b8e9))
- **aa-ethers:** refactor aa-ethers to use the viem client and accounts ([6cc2051](https://github.com/alchemyplatform/aa-sdk/commit/6cc20518bf90788f83ac3c9e579b0f4f4de518b1))

- refactor(aa-accounts)!: migrate aa-accounts to viem approach ([37a5b48](https://github.com/alchemyplatform/aa-sdk/commit/37a5b489bdd2527dca311787d5585f1dc3a5f05b))

### Features

- hoist account signing methods ([5bcfac8](https://github.com/alchemyplatform/aa-sdk/commit/5bcfac8ddaca6b712d473cbad2cbbd0228827af5))

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

# [2.4.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.1...v2.4.0) (2024-01-26)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [2.3.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.3.0...v2.3.1) (2024-01-25)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [2.3.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.2.1...v2.3.0) (2024-01-24)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [2.2.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.2.0...v2.2.1) (2024-01-23)

### Bug Fixes

- fix a couple of the package.jsons ([#374](https://github.com/alchemyplatform/aa-sdk/issues/374)) ([7abbd93](https://github.com/alchemyplatform/aa-sdk/commit/7abbd9366b9ba12377349e475025aa5edfd73255))

# [2.2.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.1.0...v2.2.0) (2024-01-22)

### Features

- add usePluginHook to demo app ([#357](https://github.com/alchemyplatform/aa-sdk/issues/357)) ([036b13b](https://github.com/alchemyplatform/aa-sdk/commit/036b13b250b1b3465dee000a6d5036ca060c2bb4))

# [2.1.0](https://github.com/alchemyplatform/aa-sdk/compare/v2.0.1...v2.1.0) (2024-01-12)

**Note:** Version bump only for package @alchemy/aa-alchemy

## [2.0.1](https://github.com/alchemyplatform/aa-sdk/compare/v2.0.0...v2.0.1) (2024-01-12)

**Note:** Version bump only for package @alchemy/aa-alchemy

# [2.0.0](https://github.com/alchemyplatform/aa-sdk/compare/v1.2.4...v2.0.0) (2024-01-12)

- feat!: update the LightAccount logic for 1271 signatures to match the on-chain impl ([bbe5060](https://github.com/alchemyplatform/aa-sdk/commit/bbe5060c01828e07d7f788485b14c04dacc6cb6f))

### Features

- add upgrade functionality for light account to msca ([#298](https://github.com/alchemyplatform/aa-sdk/issues/298)) ([18f51d9](https://github.com/alchemyplatform/aa-sdk/commit/18f51d9f626b48390a54d88b7ac28c1f162e04f8))
- update zod to allow custom viem chains in core ([#348](https://github.com/alchemyplatform/aa-sdk/issues/348)) ([291f73f](https://github.com/alchemyplatform/aa-sdk/commit/291f73f50e2e6fa382d269b8568b6255bcad4b0c))

### BREAKING CHANGES

- default LightAccountFactory address has changed

## 1.2.4 (2024-01-08)

**Note:** Version bump only for package @alchemy/aa-alchemy

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

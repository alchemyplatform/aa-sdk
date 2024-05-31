---
outline: deep
head:
  - - meta
    - property: og:title
      content: EntryPoint Support
  - - meta
    - name: description
      content: EntryPoint Support for Alchemy Accounts
  - - meta
    - property: og:description
      content: EntryPoint Support for Alchemy Accounts
---

# EntryPoint Support

`aa-sdk` supports 4 types of accounts natively (but can easily be extended to support any compatible [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) or [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) account). The below table details which EntryPoints each account is valid for.

| Account                  | EntryPoint v0.7  | EntryPoint v0.6  |
| :----------------------- | :--------------- | :--------------- |
| SimpleAccount            | ✅               | ✅               |
| LightAccount             | ✅ (_>= v2.0.0_) | ✅ (_< v.2.0.0_) |
| MultiOwnerLightAccount   | ✅               | ❌               |
| MultiOwnerModularAccount | ❌               | ✅               |
| MultisigModularAccount   | ❌               | ✅               |

---
outline: deep
head:
  - - meta
    - property: og:title
      content: Utils
  - - meta
    - name: description
      content: Overview of the Utils methods in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the Utils methods in aa-alchemy
---

# Utils

`aa-ethers` offers util methods to speed up your development with `EthersProviderAdapter` and `AccountSigner`.

Notable util methods include:

1.  [`convertWalletToAccountSigner`](/packages/aa-ethers/utils/convertWalletToAccountSigner) --
2.  [`convertEthersSignerToAccountSigner`](/packages/aa-ethers/utils/convertEthersSignerToAccountSigner) --

## Usage

::: code-group

```ts [example.ts]
import { SupportedChains } from "@alchemy/aa-alchemy";

// eth mainnet
const mainnet = SupportedChains.get(1);

// bsc is unsupported, so the variable will be undefined
const bsc = SupportedChains.get(56);
```

:::

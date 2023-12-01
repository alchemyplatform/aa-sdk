---
outline: deep
head:
  - - meta
    - property: og:title
      content: BigNumberish
  - - meta
    - name: description
      content: Overview of the BigNumberish type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the BigNumberish type in aa-core types
---

# BigNumberish

one of `Hex` (`0x{string}`), `bigint` or `number` type for representing `bigint` convertible values

```ts
import { z } from "zod";

export const HexSchema = z.custom<`0x${string}` | "0x">((val) => {
  return isHex(val) || val === "0x";
});

/*
 * type BigNumberish = Hex | number | bigint
 */
export const BigNumberishSchema = z.union([HexSchema, z.number(), z.bigint()]);
```

## Usage

::: code-group

```ts [example.ts]
import { type BigNumberish, isBigNumberish } from "@alchemy/aa-core";

const bigNumberish1 = 10000000n;
const bigNumberish2 = 0xf23cde;

console.log(isBigNumberish(bigNumberish1)); // true
console.log(isBigNumberish(bigNumberish2)); // true
```

:::

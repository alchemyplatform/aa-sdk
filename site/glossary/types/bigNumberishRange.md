---
outline: deep
head:
  - - meta
    - property: og:title
      content: BigNumberishRange
  - - meta
    - name: description
      content: Overview of the BigNumberishRange type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the BigNumberishRange type in aa-core types
---

# BigNumberishRange

object with optional fields `min` and `max` where each field is of type [`BigNumberish`](./bigNumberish.md) to represent a range type value between `min` and `max` inclusive

```ts
import { z } from "zod";

/*
 * type BigNumberishRange = {
 *   min?: Hex | number | bigint
 *   max?: Hex | number | bigint
 * }
 */

export const BigNumberishRangeSchema = z
  .object({
    min: BigNumberishSchema.optional(),
    max: BigNumberishSchema.optional(),
  })
  .strict();
```

## Usage

::: code-group

```ts [example.ts]
import { type BigNumberishRange } from "@alchemy/aa-core";

const bigNumberishRange = {
  min: 1n,
  max: "0x345dfe",
};
```

:::

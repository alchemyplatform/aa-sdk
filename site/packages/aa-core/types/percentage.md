---
outline: deep
head:
  - - meta
    - property: og:title
      content: Percentage
  - - meta
    - name: description
      content: Overview of the Percentage type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the Percentage type in aa-core types
---

# Percentage

object with required field `percentage` with a `number` value between 1 and 1000 inclusive

```ts
import { z } from "zod";

/*
 * type Percentage = {
 *   percentage?: number
 * }
 */

export const PercentageSchema = z
  .object({
    /**
     * Percent value between 1 and 1000 inclusive
     */
    percentage: z.number().min(1).max(1000),
  })
  .strict();
```

## Usage

::: code-group

```ts [example.ts]
import { type Percentage, isPercentage } from "@alchemy/aa-core";

const percentage1 = {
  percentage: 10,
};
const percentage2 = {
  percentage: 100000,
};

console.log(isPercentage(percentage1)); // true
console.log(isPercentage(percentage2)); // false
```

:::

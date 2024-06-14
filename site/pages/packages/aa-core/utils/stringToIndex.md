---
title: stringToIndex
description: A utility function to convert a string, such as an email, to salt
  for SmartAccounts
---

# stringToIndex

This function can be used to create a unique SmartAccount for a given uuid, email, or any other arbitrary string.

## Usage

:::code-group

```ts [example.ts]
const salt = stringToIndex("alice@example.com");
// 53219281434065493725260108619161294016101536485294536107629387514619165176826n

export const account = new SimpleSmartContractAccount({
  index: salt,
  // ... other args omitted
});
```

:::

## Returns

### `bigint`

## Parameters

### `phrase: string`

Any arbitrary string.

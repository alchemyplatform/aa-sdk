---
outline: deep
head:
  - - meta
    - property: og:title
      content: extend
  - - meta
    - name: description
      content: Overview of the extend method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the extend method on ISmartAccountProvider
next:
  text: SmartContractAccount
---

# extend

Allows you to add additional functionality and utility methods to this provider via a decorator pattern.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

const extendedProvider = provider.extend((provider) => ({
  debugSendUserOperation: (...args) => {
    console.log("debugging send user operation");
    return provider.sendUserOperation(...args);
  },
}));

extendedProvider.debugSendUserOperation(...);
```

<<< @/snippets/provider.ts
:::

## Returns

### `this & R`

Where `R` is the return type of the decorator function.

::: warning
The extend method will not allow you to override existing methods or properties on the provider. To do this, you'll have to use class inheritance.
:::

## Parameters

### `decoratorFn: (provider: this) => R`

A lambda function that takes the current provider as input and returns a set of extension methods and properties to add to the provider.

---
outline: deep
head:
  - - meta
    - property: og:title
      content: getDeploymentState
  - - meta
    - name: description
      content: Overview of the getDeploymentState method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getDeploymentState method on BaseSmartContractAccount
---

# getDeploymentState

Returns the current deployment state as an enum `DeploymentState` (`UNDEFINED`, `NOT_DEPLOYED`, or `DEPLOYED`) for the account

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const deploymentState = await provider.account.getDeploymentState();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<DeploymentState>`

A promise that resolves to the current deployment state as an enum `DeploymentState` (`UNDEFINED`, `NOT_DEPLOYED`, or `DEPLOYED`) for the account

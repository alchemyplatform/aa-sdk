---
outline: deep
head:
  - - meta
    - property: og:title
      content: ParticleSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on ParticleSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on ParticleSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically all EOA addresses tied to the user's Particle vault.

This method must be called after [`authenticate`](/packages/aa-signers/particle/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createParticleSigner } from "./particle";
// [!code focus:99]
const particleSigner = await createParticleSigner();

const details = await particleSigner.getAuthDetails();
```

<<< @/snippets/particle.ts
:::

## Returns

### `Promise<ParticleUserInfo>`

A Promise containing the `ParticleUserInfo`, an object derived from Particle's [`UserInfo`](https://github.com/Particle-Network/particle-react-native/blob/main/particle-auth/src/Models/LoginInfo.ts#L83) interface.

See [accountkit.alchemy.com](https://accountkit.alchemy.com/) for the most up to date documentation!

- [quick start guide](https://accountkit.alchemy.com/react/quickstart) to Account Kit
- [demo](https://demo.alchemy.com/)

![image](https://github.com/user-attachments/assets/b7a820e7-1927-4bee-8eaa-52ca4af0f87a)

## Getting Started

This repo demonstrates how you can sign messages and send transactions server-side using an embedded wallet created by the Account Kit SDK.

### Install dependencies

```bash
yarn
```

### Get your alchemy api key

- Create a new embedded accounts configuration for an alchemy app in your [dashboard](https://dashboard.alchemy.com/accounts)
- Create a `.env` file with your alchemy api key:

```
NEXT_PUBLIC_ALCHEMY_API_KEY=demo
```

_Note that prefixing the environment variable with `NEXT_PUBLIC` exposes it to the client. View best practices for protecting your API key [here](https://accountkit.alchemy.com/resources/faqs#how-should-i-protect-my-api-key-and-policy-id-in-the-frontend) before shipping to production._

### Run the app

```bash
yarn dev
```

## Details on server-side signing

- Once a user is authenticated, the client stamps two requests:

```ts
const whoamiStamp = await signer.inner.stampWhoami();
const getOrganizationStamp = await signer.inner.stampGetOrganization();
```

- These stamps are submitted to the backend (via `/api/get-api-key`).
- The backend submits these stamps to Alchemy & Turnkey to get verified information about the user and their organization. Then the backend then creates a new keypair that it can use to sign on behalf of the user. (All of this information can be stored in your database, which is useful not only for access wallet information, but also in order to not generate a new API key each time a user logs in.) The public key (along w/ whether or not it's a new key) is returned to the client.
- Once the client receives the public key from the server, it calls `signer.inner.createApiKey()` with the public key (if it's a newly created key), along with a name and expiration date. This adds the API key to the user's account. After this is done, the server is able to use the API key on behalf of the user. (See the api routes for `/api/sign` and `/api/send-transaction` for basic examples. Note that sending a transaction requires a wallet balance to pay for gas fees.)

## Further enhancements for server-side signing

- This demo app writes data to local json files instead of connecting to a database. This is just given as an example and should not be deployed to production. The keys must be securely stored as they provide access to user accounts.
- The example backend implementations currently require Turnkey packages. In the future, all of these requests should be handled via the Alchemy API, and the Turnkey packages will no longer be required.
- This example is an early proof of concept. Alchemy plans to update the Account Kit SDK to make it easier for developers to handle these requests on their backend.

---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting started guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - name: twitter:title
      content: Getting started guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
---

# Configure your Embedded Accounts

First, create an Alchemy API key, an Embedded Accounts Config, and a Gas Manager Policy. You will use these to send UOs, authenticate logins, and sponsor gas respectively.

## Alchemy API Key

The Alchemy API Key will allow you to read and write to blockchains through Alchemy’s reliable infrastructure. In this context, the API Key will let you created Embedded Accounts onchain for your users, and send UserOperations on behalf of those accounts.

To create an API Key, go to https://dashboard.alchemy.com, sign up for an account, and go through the onboarding. Then on the [apps](https://dashboard.alchemy.com/apps) page, click "Create new app" button.

<img src="/images/getting-started/api-key-create.png" alt="API Key Create" />

When configuring the Alchemy app, select Arbitrum Sepolia for the network.

<img src="/images/getting-started/api-key-configure.png" alt="API Key Configure" />

Click the API Key button in the top right corner and copy-paste it into the .env file of your application as an environment variable called `ALCHEMY_API_KEY`.

<img src="/images/getting-started/api-key-view.png" alt="API Key View" />

## Alchemy Embedded Accounts Config

The Embedded Accounts Config enables magic auth on your app’s domain by configuring the Alchemy Signer, which securely stores the user’s private key in a non-custodial [secure enclave](https://docs.turnkey.com/security/our-approach). It is responsible for authenticating a user via email or passkey using this config, managing a user’s, and signing messages to send UserOperations. Check out the [AlchemySigner docs](https://accountkit.alchemy.com/packages/aa-alchemy/signer/overview.html) for more details.

To create an Embedded Accounts Config, go to the [embedded accounts page](https://dashboard.alchemy.com/accounts) of the Alchemy dashboard and click the “New account config” button.

<img src="/images/getting-started/accounts-config-create.png" alt="Accounts Config Create" />

Then:

1. Name your config.
2. Set `http://localhost:3000` as the redirect URL. NextJS apps by default are hosted locally at port 3000, and you will want to direct the user back to the URL where your application is hosted to authenticate them.
3. [optional] Customize the logo, “Sign In” button color, and support URL of the email.

<img src="/images/getting-started/accounts-config-configure-1.png" alt="Accounts Config Configure 1" />

Next, apply this config to the Alchemy App you created in the previous step. Doing this will allow you send requests to Alchemy Signer via the Account Kit SDKs you installed before.

<img src="/images/getting-started/accounts-config-configure-2.png" alt="Accounts Config Configure 2" />

## Alchemy Gas Manager Policy

The Gas Manager Policy defines a config for Alchemy’s ERC-4337 Paymaster implementation, allowing you to sponsor your users’ gas fees. To learn more about Paymasters, check out Alchemy’s [blog post](https://www.alchemy.com/overviews/what-is-a-paymaster).

To create a Gas Manager Policy, go to the [gas manager](https://dashboard.alchemy.com/gas-manager) page of the Alchemy dashboard and click the “Create new policy” button.

<img src="/images/getting-started/gas-manager-create.png" alt="Gas Manager Create" />

Then:

1. Name your policy.
2. Associate the policy with the Alchemy App you created in the last step by selecting it in the “Policy details” section.
3. Select the default configurations for the remaining sections.

<img src="/images/getting-started/gas-manager-configure.png" alt="Gas Manager Configure" />

Once you create the policy, make sure to activate the policy by clicking the “Activate” button on the policy’s details page. Copy the Policy ID below the policy’s header and copy-paste it into the .env file of your application as an environment variable called `NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID`.

<img src="/images/getting-started/gas-manager-activate.png" alt="Gas Manager Activate" />

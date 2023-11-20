---
outline: deep
head:
  - - meta
    - property: og:title
      content: Choosing a Signer
  - - meta
    - name: description
      content: Explore Account Kit integration guides for signers including Magic.Link, Privy, Web3Auth, EOAs, and many more!
  - - meta
    - property: og:description
      content: Explore Account Kit integration guides for signers including Magic.Link, Privy, Web3Auth, EOAs, and many more!
  - - meta
    - name: twitter:title
      content: Choosing a Signer
  - - meta
    - name: twitter:description
      content: Explore Account Kit integration guides for signers including Magic.Link, Privy, Web3Auth, EOAs, and many more!
prev:
  text: Smart Accounts
  link: /smart-accounts/accounts/choosing-a-smart-account
next:
  text: Guides
  link: /guides/send-user-operation
---

# What is a Signer?

A **Signer** is a service (e.g. Magic or Turnkey) or application (e.g. MetaMask) that manages the private key and signs operations. Most web3 users today use an [Externally Owned Account (EOA)](https://ethereum.org/en/developers/docs/accounts/#externally-owned-accounts-and-key-pairs) with a self-custodial Signer such as MetaMask to manage the private key.

With Account Kit, you will deploy a **smart account** for each user instead of an EOA wallet. This smart account stores the user’s assets (e.g. tokens or NFTs). The default smart account in Account Kit is called [`LightAccount`](/smart-accounts/accounts/light-account) and it uses a typical single-owner architecture.

The smart account is controlled by an **Owner** address. The smart account will only execute a transaction if it was signed by the owner’s private key.

You can choose any Signer service or application to manage the Owner private key for the user. Using services like Magic, Turnkey, or Web3auth, you can secure the user’s account with an email, social login, or passkeys. You can also use a self-custodial wallet like MetaMask as the Signer.

This doc provides a basic introduction to signers and the criteria you should consider when choosing which Signer to use with Account Kit in your application.

## Role of a Signer

The Signer plays a crucial role in your app because it controls the user’s smart account. The Signer is responsible for:

- Securely storing the user’s private key which controls the user’s assets
- Authenticating the user
- Protecting the user’s account from phishing attacks
- Signing user operations requested by the user, if and only if the user has authenticated
- Optionally offering account recovery methods

## Supported Signers

Account Kit is compatible with any EIP-1193 provider. Many of the most popular signers can be configured in minutes through our integration guides below:

- [Magic](/smart-accounts/signers/magic)
- [web3auth](/smart-accounts/signers/web3auth)
- [Turnkey](/smart-accounts/signers/turnkey)
- [Privy](/smart-accounts/signers/privy)
- [Dynamic](/smart-accounts/signers/dynamic)
- [Fireblocks](/smart-accounts/signers/fireblocks)
- [Portal](/smart-accounts/signers/portal)
- [Capsule](/smart-accounts/signers/capsule)
- [Lit Protocol](/smart-accounts/signers/lit)
- [Self-custodial wallets like MetaMask or Ledger](/smart-accounts/signers/eoa)

If you want to use another Signer, you can integrate any other Signer by wrapping it in an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) provider or using [`SmartAccountSigner`](/smart-accounts/signers/custom-signer#implementing-smartaccountsigner) to adapt non-standard Signer.

## Criteria to consider

Here are some important criteria to consider when choosing a Signer.

- **Custody model:** Who has access to the private key?
  - Self-Custodial: the end user controls the private key and manually approves signature requests
  - Non-Custodial: a third-party service manages the private key or a subset of the key shares, but cannot sign transactions without the user’s involvement
  - Custodial: a third-party service manages the private key and can sign transactions without the user’s involvement
- **Security Model**: Assess the security model of the provider. Where is the private key stored? (on a device? in the cloud? on what cloud provider?) Is the private key encrypted? What encryption algorithm is used? Who has access to the decryption keys? This is a non-exhaustive list and we recommend doing further research.
- **Authentication Methods:** What authentication method delivers the right balance of security, self-sovereignty, and ease-of-use for your target users?
  - Email + Password: sign up for a smart account with an email and password.
  - Social Logins: sign up for a smart account with Google, Facebook, or other social logins.
  - Passkeys: sign up for a smart account secured by a passkey (e.g. fingerprint or Face ID) stored on-device.
  - Self Custodial Wallet: sign up for a smart account using a self-custodial wallet such as MetaMask or Ledger.
- **Availability:** If the Signer service provider goes down, will users be able to sign transactions?
- **Key Export:** Does the Signer allow the end user to export their private key? Can the user initiate an export even if the service provider has gone down? This is an important factor to ensure the user retains control of their assets no matter what happens to the service provider.
- **Key Recovery**: If the user forgets their password or loses their passkey, what recovery methods does the Signer provide? If the provider stores a backup copy of the private key or MPC key shares, where are those backups stored and who has access to them?

## Types of Signers

### Non-custodial Wallets

Non-custodial wallet providers store private keys such that they cannot access the private key without the user’s involvement. For example, the user must provide a password or passkey that only they know in order to decrypt the private key stored by the provider. Users benefit from heightened security, while remaining in control of their private keys at all times. This is similar to a safety deposit box vault: the provider secures the bank vault but only the user has access to the individual safety deposit boxes (e.g. wallets).

**Example**: Turnkey, Magic

### MPC Wallets (non-custodial)

Multi-Party Computation (MPC) Signers split the Owner Account private key into key shares that are then distributed to a number of share holders. Share holders only know the value of their key share and transaction holders can sign transactions without revealing their key shares to other holders.

Valid signatures do not always require all shares to sign a transaction. MPC Signers can set a threshold, requiring a certain number of shares for a signature to be valid. Common configurations are 2 of 2 shares or 2 of 3 shares. By requiring multiple shares, MPC models mitigate the risks associated with a single key being compromised.

Some MPC signers provide recovery services in which key share(s) are backed up in the service provider’s cloud, on the end user’s device, or in the end user’s cloud (e.g. iCloud or Google Drive). When evaluating an MPC provider, it’s important to under where each key share is stored.

**Example**: Privy, Fireblocks MPC, Portal, Capsule

::: details TSS vs SSSS

There are two common approaches to MPC.

Traditionally, MPC services leveraged SSSS (Shamir’s Secret Shard Sharing). This approach generates a private key in one location and then the shares are distributed to the parties involved. When a user wants to sign, they need to retrieve N of M shares and reconstruct the key locally.

An improvement on SSSS is Threshold Signature Scheme (TSS). In this model, the key is never recreated during signing. Instead, each party is given the message to sign and then signs the payload locally before broadcasting the signature to the rest of the group. This allows for the key material to remain private and deconstructed.

TSS is safer than SSSS because is possible to create the initial shares without ever constructing the original key on any one device. However, the tradeoff is that signing requires a Peer-to-Peer exchange which introduces latency.

You can read more about the difference between TSS and SSSS [here](https://www.dynamic.xyz/blog/the-evolution-of-multi-signature-and-multi-party-computation).
:::

### Decentralized MPC network (non-custodial)

A decentralized MPC network is an extension on the MPC approach outlined above. Instead of relying on a single, centralized service to store a key share and initiate signature requests, an MPC network distributes this responsibility across many nodes in a network. The user’s private key is split into many key shares with each share store by a different node. The user may request signatures from the network and a valid signature will be produced if and only if a threshold number of nodes agree to sign the request.

Examples: Lit Protocol, Web3Auth (Torus Network)

### Self-custodial wallet

Self-custodial wallets store the private key locally where only the end user can access it. For example, the user may store their seed phrase in a browser extension, in a mobile app using their phone’s secure enclave, or in a hardware wallet. When using a self-custodial wallet, the user is the only one with the power to sign transactions.

Self-custodial wallets require the user to maintain good security hygiene at all times. They also rely on the user to backup a copy of their private key in the event the wallet is lost or destroyed. If the user loses access to the device on which their private key is stored, they will have no way to recover the account unless they backed up the private key in another device or location.

**Example**: MetaMask, Ledger

### Custodial Wallet

Custodial wallet providers have full control over the user’s private key and sign transactions on behalf of the user. These services typically implement security measures to ensure that only the authorized user(s) can request a signature. These providers are also typically regulated entities (e.g., qualified custodians). The user must trust this service provider to securely store the private key and sign transactions if and only if the user wishes.

**Example**: Coinbase Custody, Bitgo

---

_Disclaimer: This page refers to third-party services, products software, technology, and content (collectively, “Third-Party Services”) that may be integrated or interact with Alchemy’s software and services. Alchemy is not responsible for any Third-Party Service, or for any compatibility issues, errors, or bugs caused in whole or in part by the Third-Party Service or any update or upgrade thereto. Your use of any Third-Party Service is at your own risk. You are responsible for obtaining any associated licenses and consents to the extent necessary for you to use the Third-Party Services. Your use of the Third-Party Services may be subject to separate terms and conditions set forth by the provider (including disclaimers or warnings), separate fees or charges, or a separate privacy notice. You are responsible for understanding and complying with any such terms or privacy notice._

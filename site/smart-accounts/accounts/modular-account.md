---
outline: deep
head:
  - - meta
    - property: og:title
      content: Modular Account (coming soon)
  - - meta
    - name: description
      content: Modular Account is coming soon to Account Kit
  - - meta
    - property: og:description
      content: Modular Account is coming soon to Account Kit
---

# Modular Account (coming soon)

We are working towards the first stable version of [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) with [the community](https://ethereum-magicians.org/t/erc-6900-modular-smart-contract-accounts-and-plugins/13885).

Soon after, we will release an ERC-6900 compatible Modular Account in Account Kit. It will support new use cases like session keys, account recovery, spending limits, and any ERC-6900 plugin you can imagine. The Light Account is forward-compatible with ERC-6900 so you can optionally upgrade it to the Modular Account once released.

If you're developing a plugin or modular account, we'd love to chat! Join the Modular Accounts [Telegram group](https://t.me/+KfB9WuhKDgk5YzIx) or [say hello](mailto:account-abstraction@alchemy.com) to a team member at Alchemy.

Read on to learn more about ERC-6900 and modular accounts.

# Motivation

In the coming years, we expect most user accounts to be smart contract accounts that leverage the benefits of account abstraction. These accounts will generally share a similar set of core features such as signature validation and ownership transfer. To ensure this core feature set is secure and does not contain any vulnerabilities, it will be prudent for most developers to re-use battle-tested smart accounts rather than writing their own accounts.

However, smart acounts are also programmable, enabling developers to build new and innovative features that hook into the validation and execution logic of a smart account. We hope and expect to see a diverse ecosystem of plugins flourish.

In order to maximize interoperability and code re-use, these plugins will ideally share a standard interface that is compatible with every smart contract account.

# ERC-6900: Modular Smart Contract Accounts and Plugins

We authored [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) to propose a standard interface for modular smart contract accounts and plugins.

By standardizing basic functions and interfaces, ERC-6900 seeks to foster a growing ecosystem of wallet and plugin developers. These developers should be able to write one plugin that works with all smart accounts, rather than fragmenting their efforts across multiple different account implementations.

For users, this standard will make it easier to discover and enable plugins. Imagine a future where a user with an ERC-6900 compatible account can install any of a thousand plugins to their smart account.

### **Architecture**

The standard focuses on the development of modules or plugins, and on the interactions between these plugins and modular smart contract accounts (or “MSCA”). Following [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337), it splits validation and execution functions in order to allow for greater customization within these components while also ensuring that they remain composable. It also adds pre- and post-execution hooks as a third functional component to plugins, enabling more finely grained functionality.

![ERC-6900](/images/erc-6900.png)

_[Source](https://eips.ethereum.org/EIPS/eip-6900)_

The architecture described in the image above is designed to achieve two technical goals:

- Provide standards for designing plugins for smart contract accounts.
- Provide standards for how compliant accounts should interact with plugins.

### Designing Plugins

The standard seeks to support open innovation in plugin development by standardizing the structures and interactions between three categories of functional components:

- **Validation functions** ensure the validity of external calls to the smart account.
- **Execution functions** are smart contracts that specify the execution logic for functions within a plugin.
- **Hooks** specify more fine-grained actions and validations that can be designed to occur pre- or post-validation, and pre- or post-execution.

### **Interacting with plugins**

ERC-6900 seeks to balance the benefits of open composability in users’ and developers’ choices with the need to maintain fundamental characteristics of security and interoperability. At a high level, it does this by standardizing how accounts and plugins interact with each other, as well as the pre-installation requirements for plugins.

ERC-6900 provides multiple possible types of interactions with plugins that vary with the nature of the account. For ERC-4437 compliant smart accounts, it follows that standard’s introduction of `Entrypoint` contract calls via UserOperations. The standard also supports calls from other account types, whether EOA or a different smart account standard.

The standard also builds on earlier work by the Android developer community to standardize the interface between smart accounts and plugins. Each compliant plugin will incorporate a manifest that establishes various functions and hooks that need to be added to the smart account on installation. It will also specify aspects of the plugin (metadata, dependencies and permissions) that are necessary to constrain the plugin’s ability to act on the smart account.

Taken together, these interactions enable a workflow that supports the seamless installation of plugins in a manner that ensures security and flexibility:

1. Plugin developers and users set each plugin’s permissions and specifies validation and hooks during installation of the the plugin onto the account.
2. Based on these permissions, plugins can then change account states or execute on behalf of the account.

For more detailed specifications of transaction flows, see the [ERC-6900 spec](https://eips.ethereum.org/EIPS/eip-6900).

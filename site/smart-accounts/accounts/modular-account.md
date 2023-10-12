---
outline: deep
head:
  - - meta
    - property: og:title
      content: Using Modular Account
  - - meta
    - name: description
      content: Using Modular Account with Account Kit
  - - meta
    - property: og:description
      content: Using Modular Account with Account Kit
---

# Modular Account & ERC-6900

Support for Modular Accounts is coming soon. Modular Accounts are based on the `ERC-6900` spec and offer a lot more flexibility and extensibility. You can read more about ERC-6900 down below.

We’re currently collaborating with the community and plan to finalize the ERC soon. `LightAccount` is fully forward-compatible with `ERC-6900`. We’ll release an upgrade once the ERC is finalized.

## ERC-6900

[ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) proposes a set of standards for modular smart account developers. It reflects a modular vision of smart accounts that allow both users and developers to build account experiences that reflect their needs and objectives.

By standardizing basic functions and interfaces, ERC-6900 seeks to foster a growing ecosystem of wallet and plugin (or module) developers by freeing them to focus on their projects rather than fragmenting their efforts across multiple ecosystem standards. Is also seeks to create a community-defined standard that avoids lock-in by any one platform, allowing users and developers to construct wallets that offer more flexibility and functionality than are possible with standard EOA accounts.

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

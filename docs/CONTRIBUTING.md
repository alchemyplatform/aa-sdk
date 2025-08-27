# Wallet docs contributing style guidelines

When writing or proofreading documentation for Alchemy projects, follow these style guidelines

# Principles

- **Simplify and abstract** - hide Account Abstraction and blockchain complexity, focus on developer outcomes not implementation details
    - Not this: Send a UserOperation to the bundler and use a paymaster
    - This: Send gasless transactions
- **Standardize** - Consistent terminology, voice, and document structure
- **Be actionable** - Clear instructions that help developers achieve their goals quickly

Follow the [Google Developer Documentation Style Guide](https://developers.google.com/style) as the foundation.

# 1. Terminology standards

**Approved terms**

- "Smart Wallets" (primary product term)
- "smart account" (lowercase in text)
- “aa-sdk” in code only
- "gasless" (not "gas-less")
- “onchain” not on-chain
- "transactions" (not "user operations")
- "sponsor gas" (not "gas manager")
- “pay gas with any token” (not “ERC20 paymaster”)

**Off-limit terms** 

Unless absolutely necessary, avoid advanced technical or AA related terms as much as possible. Only use these when discussing low level or advanced implementation details where developers need to be aware of assumptions and have choices. 

- "Account Abstraction" or "AA”
- “ERC-4337”
- "user operation" or "user ops" → use "transactions"
- "bundler" → use "sending transactions"
- "entrypoint" → implementation detail
- "smart contract account" → use "wallet"
- "Account Kit" → use "Smart Wallets"
- "gas manager" → use "sponsor gas" or “pay gas with any token”  (except "Gas Manager API")
- “paymaster" (except for "paymaster contract")
- "Signer" → use “authentication” or “owner”
- “modular account v2”, “light account v1”, any other account factory implementations → use “smart account”
- “aa-sdk” → only allowed in code

**Brand references**

- Don’t use "Alchemy" or "our"
    - e.g. not “Alchemy Smart Wallets” just “Smart Wallets”
    - e.g. not “our smart account” just “smart accounts”

# 2. Voice and tone

**Voice and tone**

- Use second person voice ("you" instead of "we" or "I") - follow the google [second person voice](https://developers.google.com/style/person) reference and rules
- Avoid first-person plural: "We recommend...”
- Be concise, direct, actionable, and opinionated on the default path
    - Use active voice, not passive voice: "Create a wallet” not “A wallet should be created”
    - Direct commands: "Install the SDK" not "You need to install...”
- Avoid unnecessary qualifiers ("perhaps", "might want to") - be opinionated and help devs go down the best recommended path
- Use consistent terminology throughout documents

**Capitalization rules**

- Capitalize product terms like “Smart Wallets”
- Only capitalize first word in titles and sidebar names
- Capitalize proper API names: "Gas Manager API" and "Bundler API"
- Capitalize type primitive definitions: `Provider`, `Signer`, `Account`

# 3. Content structure rules

**Titles and headers** 

- Do not use AA-specific or implementation specific terms in titles
- Use developer-friendly, outcome-focused titles
- Example: "Sponsor gas" not "Gas Manager Quickstart”
- Keep sidebar names and titles limited to a few words to avoid wrapping and keep to 1 line

**Other rules**

- Link to other docs instead of repeating content

# 3. Code and technical references

- Include pre-requisites and assumptions where needed
    - e.g. [Before](https://www.alchemy.com/docs/wallets/authentication/login-methods/social-login) implementing social login in your application, you need to configure your Smart Wallets dashboard and application…
    - e.g. Ensure you are on alpha version xyz
- Use backticks for all code references, function names, and technical terms
- Include language specification in code blocks
- Every piece of example code should be standalone, compilable, and working.
- Apply `twoslash` to all examples for typechecking
- Split code examples into multiple files to reduce example length. For example see how Viem does this: [https://viem.sh/docs/actions/wallet/getCallsStatus](https://viem.sh/docs/actions/wallet/getCallsStatus)
    - Use an `example.ts` tab to show the highlighted code, and a `config.ts` tab to setup the required client.
    - Every example should only require:
        1. aa-sdk install
        2. Retrieve required configs (API keys, Policy IDs, private key)
        3. Copy the 2+ files
        4. Run `example.ts`
- Highlight and focus on the critical part of the example using Fern highlighting in code blocks https://buildwithfern.com/learn/docs/writing-content/components/code-blocks
- Use snippets for common configuration to avoid duplicate code snippets

# 4. Markdown formatting

- Implement the [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html) for formatting
- Follow remark-lint rules for consistent formatting
- Consistent bullet point formatting rules
- Use proper heading hierarchy (H1 → H2 → H3)
- Include alt text for images
- If a guide for a feature supports multiple frameworks, split into tabs for each framework within one document
    - e.g. React, React Native, Other JavaScript tabs
- Use relative links
    - For example use [/wallets/…] not [https://www.alchemy.com/docs/wallets/authentication/overview](https://www.alchemy.com/docs/wallets/authentication/overview)
- No broken or circular references

# Quality checklist

### Terminology Check

- [ ]  No off-limit terms used
- [ ]  Approved terms used correctly
- [ ]  Proper capitalization applied
- [ ]  No AA terms in headers

### Style Check

- [ ]  Follows Google style guidelines
- [ ]  Second-person voice throughout
- [ ]  Active voice used
- [ ]  Direct, confident tone
- [ ]  Outcome-focused titles

### Code Check

- [ ]  Twoslash applied to snippets
- [ ]  Language specified
- [ ]  Code properly formatted with backticks

### Format Check

- [ ]  Proper markdown hierarchy
- [ ]  Relative links used
- [ ]  No broken or circular references
- [ ]  Links used instead of repetition
- [ ]  Consistent spacing and formatting
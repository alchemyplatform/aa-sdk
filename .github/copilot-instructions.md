---
applyTo: "docs/**/*.mdx"
---

# Smart Wallets Documentation Review Instructions

## Project Overview

This repository contains Alchemy's Smart Wallets SDK (aa-sdk) documentation. The documentation is built using Fern and focuses on simplifying Account Abstraction concepts for developers by hiding blockchain complexity and emphasizing practical outcomes.

## Documentation Structure

- `/docs/`: Main documentation directory containing all `.mdx` files
- `/docs/CONTRIBUTING.md`: Comprehensive style guide and standards
- Documentation follows a developer-first approach with outcome-focused content

## Core Documentation Principles

### 1. Terminology Standards

**Always Use These Terms:**
- `Smart Wallets` (capitalized, product reference)
- `smart account` (lowercase, technical term)
- `aa-sdk` (code references only, never in prose)
- `gasless` (not "gas-less")
- `onchain` (not "on-chain")
- `transactions` (not "user operations")
- `sponsor gas` (not "gas manager")
- `pay gas with any token` (not "ERC20 paymaster")

**Never Use These Terms:**
- "Account Abstraction" or "AA" → Avoid entirely
- "ERC-4337" → Avoid entirely except in protocol-specific contexts
- "user operation" or "user ops" → Use "transactions"
- "bundler" → Use "sending transactions"
- "entrypoint" → Avoid entirely
- "smart contract account" → Use "wallet"
- "Account Kit" → Use "Smart Wallets"
- "paymaster" → Use context-specific replacements
- "Signer" → Use "authentication" or "owner"
- "modular account v2", "light account v1" → Use "smart account"

### 2. Voice and Tone Requirements

**Mandatory Voice Rules:**
- Use second person ("you") throughout - never "we", "I", or "one"
- Use active voice consistently
- Write direct commands: "Install the SDK" not "You should install..."
- Be confident and direct - avoid qualifiers like "perhaps", "might", "may wish to"
- Never use company references like "Alchemy" or "our" in documentation

### 3. Content Structure Standards

**Headers and Titles:**
- No AA-specific terms in titles or headers
- Use developer-friendly, outcome-focused titles
- Keep concise for sidebar navigation
- Capitalize first word only for titles and sidebar names

**Code Standards:**
- Apply `twoslash` to all TypeScript code examples
- Include language specification in all code blocks
- Use backticks for all code references, function names, and technical terms
- Examples must be standalone, compilable, and working
- Always include prerequisites and version requirements

### 4. Quality Assurance Requirements

**Before Publishing Any Documentation Changes:**

**Terminology Validation:**
- [ ] No prohibited terms used anywhere
- [ ] All approved terms used correctly and consistently
- [ ] Proper capitalization applied throughout
- [ ] No AA-specific terms in headers or titles

**Voice and Style Validation:**
- [ ] Second-person voice used throughout ("you" not "we")
- [ ] Active voice used consistently
- [ ] Direct, confident tone without unnecessary qualifiers
- [ ] Outcome-focused titles and headers

**Technical Validation:**
- [ ] Twoslash applied to all TypeScript code snippets
- [ ] Language specified for all code blocks
- [ ] All code references properly formatted with backticks
- [ ] Examples are standalone, compilable, and working
- [ ] Prerequisites clearly stated

**Format Validation:**
- [ ] Proper markdown hierarchy maintained
- [ ] All links are relative and functional
- [ ] No broken or circular references
- [ ] Consistent spacing and formatting throughout

## Build and Validation

Always run these commands after making documentation changes:
- Validate documentation builds successfully
- Check for broken links and references
- Ensure code examples compile and execute correctly

## Framework Support

When documenting features that support multiple frameworks:
- Use tabs within one document rather than separate files
- Standard tabs: React, React Native, Other JavaScript
- Maintain consistency across all framework examples

## Link Strategy

- Use relative links: `/wallets/...` not full URLs
- Link to existing documentation instead of repeating content
- Ensure no broken or circular references exist

Remember: The goal is to make Account Abstraction invisible to developers while providing clear, actionable guidance for building with Smart Wallets.
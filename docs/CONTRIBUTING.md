# Wallet Documentation Contributing Guidelines

<!-- AI ASSISTANT INSTRUCTIONS START -->
## 🤖 AI Assistant Guidelines

**ROLE**: You are helping write documentation for Alchemy's Smart Wallets product. Always follow these rules when generating or editing content.

**CORE PRINCIPLES**:
- SIMPLIFY: Hide blockchain complexity, focus on developer outcomes
- STANDARDIZE: Use consistent terminology and voice
- ACTIONABLE: Provide clear, direct instructions

**TERMINOLOGY ENFORCEMENT**:
- ALWAYS use approved terms from the "Approved Terms" section
- NEVER use terms from the "Prohibited Terms" section
- REPLACE prohibited terms with their approved alternatives

**VOICE REQUIREMENTS**:
- Use second person ("you") not first person ("we", "I")
- Use active voice, not passive voice
- Be direct and confident, avoid qualifiers like "perhaps", "might"
- Follow Google Developer Documentation Style Guide standards

<!-- AI ASSISTANT INSTRUCTIONS END -->

## Overview

When writing or editing documentation for Alchemy Smart Wallets, follow these comprehensive style guidelines. These rules ensure consistency, clarity, and developer-focused content that abstracts away blockchain complexity.

**Foundation**: Follow the [Google Developer Documentation Style Guide](https://developers.google.com/style) as the base standard.

---

## 1. Core Principles

### Simplify and Abstract
- **Goal**: Hide Account Abstraction and blockchain complexity
- **Focus**: Developer outcomes, not implementation details
- **Example**:
  - ❌ **Don't**: "Send a UserOperation to the bundler and use a paymaster"
  - ✅ **Do**: "Send gasless transactions"

### Standardize
- **Goal**: Consistent terminology, voice, and document structure across all docs
- **Application**: Use identical terms for identical concepts

### Be Actionable  
- **Goal**: Clear instructions that help developers achieve goals quickly
- **Implementation**: Direct commands, specific steps, working examples

---

## 2. Terminology Standards

### ✅ Approved Terms (ALWAYS USE)

| Term | Usage | Context |
|------|-------|---------|
| `"Smart Wallets"` | Primary product term | Capitalize when referring to the product |
| `"smart account"` | Technical term | Lowercase in general text |
| `"aa-sdk"` | Code references only | Never in prose, only in code blocks |
| `"gasless"` | Payment model | Not "gas-less" |
| `"onchain"` | Blockchain reference | Not "on-chain" |
| `"transactions"` | User actions | Not "user operations" |
| `"sponsor gas"` | Gas payment feature | Not "gas manager" |
| `"pay gas with any token"` | ERC20 payment feature | Not "ERC20 paymaster" |

### ❌ Prohibited Terms (NEVER USE)

**Replacement Rules**:

| Prohibited Term | ➡️ Use Instead | Exception |
|----------------|----------------|-----------|
| `"Account Abstraction"` or `"AA"` | Avoid entirely | Only in advanced technical docs |
| `"ERC-4337"` | Avoid entirely | Only when discussing protocol specifics |
| `"user operation"` or `"user ops"` | `"transactions"` | Never |
| `"bundler"` | `"sending transactions"` | Never |
| `"entrypoint"` | Avoid entirely | Implementation detail |
| `"smart contract account"` | `"wallet"` | Never |
| `"Account Kit"` | `"Smart Wallets"` | Never |
| `"gas manager"` | `"sponsor gas"` or `"pay gas with any token"` | Except "Gas Manager API" |
| `"paymaster"` | Context-specific replacement | Except "paymaster contract" |
| `"Signer"` | `"authentication"` or `"owner"` | Never |
| `"modular account v2"`, `"light account v1"` | `"smart account"` | Never |

### 🏷️ Brand Reference Rules

**Company References**:
- ❌ **Don't use**: "Alchemy" or "our" in documentation
- ✅ **Examples**:
  - ❌ "Alchemy Smart Wallets" → ✅ "Smart Wallets"
  - ❌ "our smart account" → ✅ "smart accounts"

---

## 3. Voice and Tone Standards

### 📝 Voice Requirements

**Second Person Voice** (REQUIRED):
- ✅ **Use**: "you" throughout documentation
- ❌ **Avoid**: "we", "I", "one"
- ❌ **Never**: "We recommend..." → ✅ **Use**: "Recommended approach:"

**Active Voice** (REQUIRED):
- ✅ **Use**: "Create a wallet"
- ❌ **Avoid**: "A wallet should be created"

**Direct Commands** (REQUIRED):
- ✅ **Use**: "Install the SDK"
- ❌ **Avoid**: "You need to install..." or "You should install..."

### 🎯 Tone Requirements

**Be Confident and Opinionated**:
- ❌ **Avoid qualifiers**: "perhaps", "might want to", "you may wish to"
- ✅ **Be direct**: State the recommended approach clearly

**Consistency**:
- Use identical terminology for identical concepts across all documents
- Maintain consistent voice throughout each document

### 📐 Capitalization Rules

| Type | Rule | Examples |
|------|------|----------|
| **Product terms** | Capitalize | "Smart Wallets" |
| **Titles and sidebar names** | Capitalize first word only | "Getting started with authentication" |
| **API names** | Capitalize proper nouns | "Gas Manager API", "Bundler API" |
| **Type definitions** | Capitalize | `Provider`, `Signer`, `Account` |

---

## 4. Content Structure Rules

### 📋 Headers and Titles

**Requirements**:
- ❌ **No AA-specific terms** in titles or headers
- ✅ **Use developer-friendly, outcome-focused titles**
- ✅ **Keep concise** for sidebar navigation (avoid wrapping)

**Examples**:
- ❌ "Gas Manager Quickstart" → ✅ "Sponsor gas"
- ❌ "UserOp Configuration" → ✅ "Configure transactions"

### 🔗 Content Organization

**Link Strategy**:
- **Link to existing docs** instead of repeating content
- **Use relative links**: `/wallets/...` not full URLs
- **Ensure no broken or circular references**

---

## 5. Code and Technical Standards

### 📋 Prerequisites and Setup

**Always Include**:
- Prerequisites and assumptions
- Version requirements
- Configuration steps

**Examples**:
```markdown
Before implementing social login, configure your Smart Wallets dashboard...
Ensure you are using aa-sdk version 3.x or later...
```

### 💻 Code Block Requirements

**Formatting Rules**:
- ✅ **Use backticks** for all code references, function names, technical terms
- ✅ **Include language specification** in code blocks
- ✅ **Apply `twoslash`** to all examples for type checking

**Example Structure**:
````markdown
```ts twoslash
// Your example code here
```
````

### 🏗️ Example Standards

**Every Example Must Be**:
1. **Standalone** - can be copied and run independently
2. **Compilable** - passes type checking
3. **Working** - produces expected results

**Example Organization**:
- Split long examples into multiple files
- Use `example.ts` tab for main code
- Use `config.ts` tab for setup
- Follow this pattern:
  1. Install aa-sdk
  2. Get required configs (API keys, Policy IDs, private key)
  3. Copy the files
  4. Run `example.ts`

**Highlighting**:
- Use [Fern highlighting](https://buildwithfern.com/learn/docs/writing-content/components/code-blocks) to focus on critical parts
- Use snippets for common configuration to avoid duplication

---

## 6. Markdown Formatting Standards

### 📝 Structure Requirements

**Follow**:
- [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html)
- Remark-lint rules for consistency
- Proper heading hierarchy (H1 → H2 → H3)

**Framework Support**:
- If a guide supports multiple frameworks, use tabs within one document
- Example tabs: React, React Native, Other JavaScript

**Links and References**:
- ✅ **Use relative links**: `[/wallets/authentication]`
- ❌ **Avoid full URLs**: `[https://www.alchemy.com/docs/...]`
- ✅ **Include alt text** for all images
- ✅ **Verify no broken links**

---

## 7. Quality Assurance Checklist

### ✅ Pre-Publish Validation

**Terminology Validation**:
- [ ] No prohibited terms used anywhere in the document
- [ ] All approved terms used correctly and consistently
- [ ] Proper capitalization applied throughout
- [ ] No AA-specific terms in headers or titles

**Voice and Style Validation**:
- [ ] Follows Google Developer Documentation Style Guide
- [ ] Second-person voice used throughout ("you" not "we")
- [ ] Active voice used consistently
- [ ] Direct, confident tone without unnecessary qualifiers
- [ ] Outcome-focused titles and headers

**Code and Technical Validation**:
- [ ] Twoslash applied to all code snippets
- [ ] Language specified for all code blocks
- [ ] All code references properly formatted with backticks
- [ ] Examples are standalone, compilable, and working
- [ ] Prerequisites clearly stated

**Format and Structure Validation**:
- [ ] Proper markdown hierarchy maintained
- [ ] All links are relative and functional
- [ ] No broken or circular references
- [ ] Content links to existing docs instead of repeating information
- [ ] Consistent spacing and formatting throughout

### 🔧 AI Assistant Validation

**For AI Tools** (GitHub Copilot, Cursor, etc.):
- [ ] Document follows structured format for easy parsing
- [ ] Clear do/don't examples provided
- [ ] Terminology rules explicitly stated with replacements
- [ ] Voice requirements clearly defined
- [ ] Code standards include specific formatting requirements

---

## 8. Implementation Guide

### For Human Contributors

1. **Before Writing**: Review this entire guide
2. **While Writing**: Reference the approved/prohibited terms tables
3. **Before Submitting**: Complete the quality checklist
4. **When Editing**: Ensure consistency with existing docs

### For AI Assistants

1. **Priority Order**: Terminology > Voice > Structure > Style
2. **Conflict Resolution**: When in doubt, choose the simpler, more developer-friendly option
3. **Validation**: Cross-reference every term against the approved/prohibited lists
4. **Consistency**: Maintain identical terminology across all generated content

---

*This document is the definitive style guide for Smart Wallets documentation. All content must conform to these standards.*

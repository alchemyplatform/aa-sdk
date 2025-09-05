# Vale Configuration for Smart Wallets Documentation

This directory contains Vale configuration and custom style rules for linting Alchemy Smart Wallets documentation according to the guidelines in `/docs/CONTRIBUTING.md`.

## Setup

### Prerequisites

1. **Install Vale**:

   ```bash
   # macOS with Homebrew
   brew install vale

   # Other platforms: https://vale.sh/docs/vale-cli/installation/
   ```

2. **Verify installation**:
   ```bash
   vale --version
   ```

## Usage

### Quick Start

```bash
# From project root, run Vale on specific MDX files
vale docs/pages/some-page.mdx

# Run on all MDX files in docs directory
vale docs/**/*.mdx

# Use yarn script
yarn lint:docs
```

### Configuration Files

- **`.vale.ini`** - Main Vale configuration file
- **`styles/SmartWallets/`** - Custom style rules directory

### Custom Style Rules

The SmartWallets style includes these rules based on `CONTRIBUTING.md`:

#### 1. **Terminology.yml** (Error Level)

- Enforces approved terms from CONTRIBUTING.md
- Replaces prohibited terms with approved alternatives
- Examples:
  - ❌ "Account Abstraction" → ✅ "smart account functionality"
  - ❌ "user operations" → ✅ "transactions"
  - ❌ "bundler" → ✅ "transaction processing"

#### 2. **Voice.yml** (Error Level)

- Enforces second-person voice ("you" instead of "we")
- Detects first-person usage patterns

#### 3. **PassiveVoice.yml** (Warning Level)

- Detects passive voice constructions
- Encourages active voice per style guide

#### 4. **DirectCommands.yml** (Warning Level)

- Encourages direct commands over indirect suggestions
- ❌ "You should install..." → ✅ "Install..."

#### 5. **Qualifiers.yml** (Suggestion Level)

- Detects unnecessary qualifiers that weaken tone
- Examples: "perhaps", "might want to", "you may wish to"

#### 6. **CodeFormatting.yml** (Suggestion Level)

- Ensures technical terms are wrapped in backticks
- Examples: `aa-sdk`, `getSigner`, `Provider`

#### 7. **Capitalization.yml** (Error Level)

- Enforces sentence case for headings only
- Preserves proper nouns and acronyms

### Ignoring Vale Rules

To temporarily disable Vale checking in documentation:

```markdown
<!-- vale off -->

This content will be ignored by Vale.
You can use prohibited terms here for technical accuracy.

<!-- vale on -->
```

To ignore specific rules:

```markdown
<!-- vale SmartWallets.Terminology = NO -->

This allows using Account Abstraction terminology when needed.

<!-- vale SmartWallets.Terminology = YES -->
```

## MDX Support

**Current Status**: Vale is configured to lint MDX files only. If you encounter issues with MDX processing, you may need to install additional dependencies:

```bash
# If MDX processing fails, try installing mdx2vast
npm install -g mdx2vast
```

**Note**: Vale will attempt to process MDX files directly. Most rules should work without additional setup.

## Integration

### VS Code Integration

Install the [Vale VS Code extension](https://marketplace.visualstudio.com/items?itemName=errata-ai.vale-server) for real-time linting.

## Customization

### Adding New Rules

1. Create a new `.yml` file in `styles/SmartWallets/`
2. Follow Vale's rule format: https://vale.sh/docs/topics/styles/
3. Test the rule: `vale --config=.vale.ini docs/test-file.md`

### Modifying Existing Rules

Edit the relevant `.yml` file in `styles/SmartWallets/` and test changes.

### Vocabulary

Add approved terms to `styles/SmartWallets/vocab.txt` to prevent spelling errors.


### Testing Changes

```bash
# Test a specific rule
vale --config=.vale.ini --filter='*.Terminology' docs/README.md

# Test with different alert levels
vale --minAlertLevel=error docs/README.md
```

## Resources

- [Vale Documentation](https://vale.sh/docs/)
- [Smart Wallets Contributing Guidelines](/docs/CONTRIBUTING.md)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)

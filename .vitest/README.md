# Vitest Testing Infrastructure

This directory contains the testing infrastructure for the aa-sdk project using Vitest.

## Prerequisites

### Anvil Installation

To run the tests in this project, you need to have **Anvil** installed. Anvil is part of the Foundry toolchain and is used as a local Ethereum node for testing.

#### Install via Foundryup (Recommended)

The easiest way to install Anvil is through Foundryup, the official installer for the Foundry toolchain.

1. **Install Foundryup:**

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```

2. **Install the latest stable version:**
   ```bash
   foundryup
   ```

This will install `forge`, `cast`, `anvil`, and `chisel` binaries.

#### Verify Installation

Check that Anvil is installed correctly:

```bash
anvil --version
```

For complete installation instructions and troubleshooting, visit the official Foundry documentation:
**https://getfoundry.sh/introduction/installation/**

## Running Tests

Once Anvil is installed, you can run the tests using:

```bash
yarn test
```

The test infrastructure will automatically start and manage Anvil instances as needed.

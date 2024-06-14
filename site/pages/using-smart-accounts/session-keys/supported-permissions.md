---
title: Session Key Supported Permissions
description: All permissions the Alchemy Session Key Plugin supports.
---

# Supported Permissions

### Time range

Supports a start time and an end time for each session key.

### Access control lists

Supports either an allowlist or a denylist for addresses. Optionally, access control lists may also specify specific functions on contracts to allow or deny.

### ERC-20 spending Limits

Supports limiting how much of a specific ERC-20 token a key may spend. This may be a total for the key, or refreshing on an interval (e.g. 100 USDC per week).

### Native token spending limits

Supports limiting how much of the native token, e.g. ETH or MATIC, a key may spend. This may be a total for the key, or refreshing on an interval (e.g. 1 ETH per week).

### Gas spending limits

Supports limiting how much of the native token (e.g. ETH or MATIC) a session key can spend on gas. This may be a total for the key, or refreshing on an interval (e.g. 1 ETH per week).

Alternatively, you can also require that a session key uses a specific paymaster address, instead of spending the account’s native token for gas.

## Importance of Gas Limits

Gas spend limits are critically important to protecting the account. If you are using a session key, you should configure either a required paymaster rule or a gas spend limit. Failing to do so could allow a compromised session key to drain the account’s native token balance.

Note that the gas limit is tracked in terms of native token units (wei), not in units of gas. The gas usage of a user operation is considered to be the maximum gas a user operation can spend, i.e. `total gas limit * maxFeePerGas`. This can overestimate when compared to the actual gas cost of each user operation.

## Default values

Permissions start with the following default values:

| Permission               | Default Value                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Access control list      | Type: allowlist <br /> The list starts empty. When the allowlist is empty, all calls will be denied.                                             |
| Time range               | Unlimited                                                                                                                                        |
| Native token spend limit | 0 <br /> This means all calls spending the native token will be denied, unless the limit is updated or removed.                                  |
| ERC-20 spend limit       | Unset. If you want to enabled an ERC-20 spend limit, add the ERC-20 token contract to the access control list and set the spending limit amount. |
| Gas spend limits         | Unset. When defining the session key’s permissions, you should specify either a gas spending limit or a required paymaster.                      |

## Using the PermissionsBuilder

To construct the data to set a key's permissions, you will need to use the `SessionKeyPermissionBuilder` class. This will allow you to specify a series of updates, and when complete, you may generate the encoded data to perform all updates at once.

The permissions data may be specified in 3 places:

- In the Session Key Plugin's `onInstall` data, setting the intial permissions for a session key added at install time.
- As data for the initial permissions of a session key added via `addSessionKey`.
- As a parameter to the `updateKeyPermissions` function, to change the permissions of an existing key.

#### Generating the permissions

```ts [generate-permissions.ts]
// [!include ~/snippets/session-keys/supported-permissions.ts:generatepermissions]
```

#### Example: Permissions in plugin install data

```ts [permissions-in-plugin-install.ts]
// [!include ~/snippets/session-keys/supported-permissions.ts:permissionsinplugininstall]
```

#### Example: Initial permissions for a new key

```ts [permissions-in-add.ts]
// [!include ~/snippets/session-keys/supported-permissions.ts:permissionsinadd]
```

#### Exmaple: Updating a session key's permissions

This example updates a key's time range, but leaves other permissions to their current values.

```ts [permissions-in-update.ts]
// [!include ~/snippets/session-keys/supported-permissions.ts:permissionsinupdate]
```

### Permissions Builder full reference

:::details[View the full set of supported permissions here]

```ts
// [!include ~/../packages/accounts/src/msca/plugins/session-key/permissions.ts]
```

:::

## Reading Permissions

You may wish to view the current permissions of a given session key. This can be done using view functions defined by the Session Key Plugin.

Here's an example of viewing all permissions in TypeScript:

```ts [view-permissions.ts]
// [!include ~/snippets/session-keys/supported-permissions.ts:viewpermissions]
```

### Permission View Functions

The following view functions are declared by the session key plugin and used to read information about permissions. These are the functions used in the example above.

```solidity
enum ContractAccessControlType {
    ALLOWLIST, // Allowlist is default
    DENYLIST,
    ALLOW_ALL_ACCESS // Disables contract access control, any address and selector are allowed.
}

// Struct returned by view functions to provide information about a session key's spend limit.
// Used for native token, ERC-20, and gas spend limits.
struct SpendLimitInfo {
    bool hasLimit;
    uint256 limit;
    uint256 limitUsed;
    uint48 refreshInterval;
    uint48 lastUsedTime;
}

/// @notice Get the access control type for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @return The access control type for the session key on the account.
function getAccessControlType(address account, address sessionKey)
    external
    view
    returns (ContractAccessControlType);

/// @notice Get an access control entry for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @param targetAddress The target address to check.
/// @return isOnList Whether the target address is on the list (either allowlist or blocklist depending on the
/// access control type).
/// @return checkSelectors Whether the target address should be checked for selectors during permissions
/// enforcement.
function getAccessControlEntry(address account, address sessionKey, address targetAddress)
    external
    view
    returns (bool isOnList, bool checkSelectors);

/// @notice Get whether a selector is on the access control list for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @param targetAddress The target address to check.
/// @param selector The selector to check.
/// @return isOnList Whether the selector is on the list (either allowlist or blocklist depending on the
/// access control type).
function isSelectorOnAccessControlList(
    address account,
    address sessionKey,
    address targetAddress,
    bytes4 selector
) external view returns (bool isOnList);

/// @notice Get the active time range for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @return validAfter The time after which the session key is valid.
/// @return validUntil The time until which the session key is valid.
function getKeyTimeRange(address account, address sessionKey)
    external
    view
    returns (uint48 validAfter, uint48 validUntil);

/// @notice Get the native token spend limit for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @return A struct with fields describing the state of native token spending limits on this session key.
function getNativeTokenSpendLimitInfo(address account, address sessionKey)
    external
    view
    returns (SpendLimitInfo memory);

/// @notice Get the gas spend limit for a session key on an account.
/// Note that this spend limit is measured in wei, not units of gas.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @return info A struct with fields describing the state of gas spending limits on this session key.
/// @return shouldReset Whether this session key must be reset by calling `resetSessionKeyGasLimitTimestamp`
/// before it can be used.
function getGasSpendLimit(address account, address sessionKey)
    external
    view
    returns (SpendLimitInfo memory info, bool shouldReset);

/// @notice Get the ERC20 spend limit for a session key on an account.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @param token The token to check.
/// @return A struct with fields describing the state of ERC20 spending limits on this session key.
function getERC20SpendLimitInfo(address account, address sessionKey, address token)
    external
    view
    returns (SpendLimitInfo memory);

/// @notice Get the required paymaster address for a session key on an account, if any.
/// @param account The account to check.
/// @param sessionKey The session key to check.
/// @return The required paymaster address for this session key on this account, or the zero address if the
/// rule is disabled.
function getRequiredPaymaster(address account, address sessionKey) external view returns (address);
```

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import {
  createModularAccountAlchemyClient,
  SessionKeyAccessListType,
  SessionKeyPermissionsBuilder,
  SessionKeyPlugin,
  sessionKeyPluginActions,
  SessionKeySigner,
} from "@account-kit/smart-contracts";
import { keccak256, zeroHash } from "viem";

const transport = alchemy({ apiKey: "ALCHEMY_API_KEY" });
export const client = (
  await createModularAccountAlchemyClient({
    chain: sepolia,
    signer: LocalAccountSigner.mnemonicToAccountSigner("MNEMONIC"),
    transport,
  })
).extend(sessionKeyPluginActions);

const sessionKeySigner = new SessionKeySigner();

// [!region generatepermissions]
// Let's create an initial permission set for the session key giving it an eth spend limit
const keyPermissions = new SessionKeyPermissionsBuilder()
  .setNativeTokenSpendLimit({
    spendLimit: 1000000n,
  })
  // this will allow the session key plugin to interact with all addresses
  .setContractAccessControlType(SessionKeyAccessListType.ALLOW_ALL_ACCESS)
  .setTimeRange({
    validFrom: Math.round(Date.now() / 1000),
    // valid for 1 hour
    validUntil: Math.round(Date.now() / 1000 + 60 * 60),
  });
// [!endregion generatepermissions]

{
  // [!region permissionsinplugininstall]
  const result = await client.installSessionKeyPlugin({
    // 1st arg is the initial set of session keys
    // 2nd arg is the tags for the session keys
    // 3rd arg is the initial set of permissions
    args: [
      [await sessionKeySigner.getAddress()],
      [zeroHash],
      [keyPermissions.encode()],
    ],
  });
  // [!endregion permissionsinplugininstall]
}

{
  // [!region permissionsinadd]
  const result = await client.addSessionKey({
    key: "0x1234123412341234123412341234123412341234", // Session key address
    tag: keccak256(new TextEncoder().encode("session-key-tag")), // Session key tag
    permissions: keyPermissions.encode(), // Initial permissions
  });
  // [!endregion permissionsinadd]
}

{
  // [!region permissionsinupdate]
  const result = await client.updateSessionKeyPermissions({
    key: "0x1234123412341234123412341234123412341234", // Session key address
    // add other permissions to the builder, if needed
    permissions: new SessionKeyPermissionsBuilder()
      .setTimeRange({
        validFrom: Math.round(Date.now() / 1000),
        // valid for 1 hour
        validUntil: Math.round(Date.now() / 1000 + 60 * 60),
      })
      .encode(),
  });
  // [!endregion permissionsinupdate]
}

// [!region viewpermissions]
const sessionKeyPluginView = SessionKeyPlugin.getContract(client).read;
const accountAddress = client.getAddress();
const sessionKeyAddress = await sessionKeySigner.getAddress();

const exampleTargetAddress = "0x4567456745674567456745674567456745674567";
const exampleTargetSelector = "0x78907890";
const exampleERC20Address = "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd";

// Using session key permissions view functions

// The key's current access control type. One of:
// - SessionKeyAccessListType.ALLOWLIST
// - SessionKeyAccessListType.DENYLIST
// - SessionKeyAccessListType.ALLOW_ALL_ACCESS
const accessControlType = await sessionKeyPluginView.getAccessControlType([
  accountAddress,
  sessionKeyAddress,
]);

// - Whether or not the address is on the access control list (either allowlist or denylist, depending on setting).
// - Whether or not the function selectors should be checked for the target address (checked according to the access control type).
const [isTargetAddressOnList, checkSelectors] =
  await sessionKeyPluginView.getAccessControlEntry([
    accountAddress,
    sessionKeyAddress,
    exampleTargetAddress,
  ]);

// Whether or not the selector is on the access control list
const isTargetSelectorOnList =
  await sessionKeyPluginView.isSelectorOnAccessControlList([
    accountAddress,
    sessionKeyAddress,
    exampleTargetAddress,
    exampleTargetSelector,
  ]);

// The start and end timestamp of a key.
// If either is zero, that means the value is unset.
const [validAfter, validUntil] = await sessionKeyPluginView.getKeyTimeRange([
  accountAddress,
  sessionKeyAddress,
]);

// The native token spending limit of a key. Details below
const nativeTokenSpendingLimit =
  await sessionKeyPluginView.getNativeTokenSpendLimitInfo([
    accountAddress,
    sessionKeyAddress,
  ]);

const {
  hasLimit: hasNativeTokenSpendLimit, // Whether or not a native token spending limit is enforced on the session key
  limit: nativeTokenSpendLimit, // The limit's maximum value. If a refresh interval is set, this is the max per interval.
  limitUsed: nativeTokenSpendLimitUsed, // How much of the limit is used. If a refresh interval is set, this is the amount used in the current interval.
  refreshInterval: nativeTokenRefreshInterval, // How often to reset the limit and start counting again. If zero, never refresh the limit.
  lastUsedTime: nativeTokenLastUsedTime, // The start of the latest interval, if using the refresh interval.
} = nativeTokenSpendingLimit;

// The spending limit for an ERC-20 token.
const erc20SpendingLimit = await sessionKeyPluginView.getERC20SpendLimitInfo([
  accountAddress,
  sessionKeyAddress,
  exampleERC20Address,
]);

const {
  hasLimit: hasErc20TokenSpendLimit, // Whether or not an ERC-20 token spending limit is enforced on the session key for this token address.
  limit: erc20TokenSpendLimit, // The limit's maximum value. If a refresh interval is set, this is the max per interval.
  limitUsed: erc20TokenSpendLimitUsed, // How much of the limit is used. If a refresh interval is set, this is the amount used in the current interval.
  refreshInterval: erc20TokenRefreshInterval, // How often to reset the limit and start counting again. If zero, never refresh the limit.
  lastUsedTime: erc20TokenLastUsedTime, // The start of the latest interval, if using the refresh interval.
} = erc20SpendingLimit;

// - The spending limit on gas for a given session key, measured in wei.
// - Whether or not the spending limit will reset in the next interval, if a refresh interval is set.
const [gasSpendingLimit, shouldReset] =
  await sessionKeyPluginView.getGasSpendLimit([
    accountAddress,
    sessionKeyAddress,
  ]);

const {
  hasLimit: hasGasSpendLimit, // Whether or not a gas spending limit is enforced on the session key
  limit: gasSpendLimit, // The gas limit's maximum spend amount, in wei. If a refresh interval is set, this is the max per interval.
  limitUsed: gasSpendLimitUsed, // How much of the limit is used. If a refresh interval is set, this is the amount used in the current interval.
  refreshInterval: gasRefreshInterval, // How often to reset the limit and start counting again. If zero, never refresh the limit.
  lastUsedTime: gasLastUsedTime, // The start of the latest interval, if using the refresh interval.
} = gasSpendingLimit;

// The paymaster address required for a given session key.
// If there is no required paymaster, this will return the zero address.
const requiredPaymaster = await sessionKeyPluginView.getRequiredPaymaster([
  accountAddress,
  sessionKeyAddress,
]);
// [!endregion viewpermissions]

// To suppress typescript errors about unused variables from destructuring, "use" the variables here.
// For some reason, this is an error, and not just a warning. (TS error 6198)

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
hasNativeTokenSpendLimit;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
hasErc20TokenSpendLimit;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
hasGasSpendLimit;

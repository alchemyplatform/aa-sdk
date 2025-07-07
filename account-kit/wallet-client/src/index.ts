// Add you exports here, make sure to export types separately from impls and use the `type` keyword when exporting them
// Don't use wildcard exports, instead use named exports

export { VERSION } from "./version.js";

// Example exports - replace with your actual wallet client exports
export type { WalletClientConfig } from "./types.js";
export { createWalletClient } from "./client.js";

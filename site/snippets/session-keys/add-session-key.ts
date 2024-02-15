import { SessionKeyPermissionsBuilder } from "@alchemy/aa-accounts";
import { client } from "./base-client.js";
import { keccak256 } from "viem";

const result = await client.addSessionKey({
  key: "0xSessionKeyAddress",
  // tag is an identifier for the emitted SessionKeyAdded event
  tag: keccak256(new TextEncoder().encode("session-key-tag")),
  permissions: new SessionKeyPermissionsBuilder().encode(),
});

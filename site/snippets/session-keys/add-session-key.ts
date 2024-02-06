import { SessionKeyPermissionsBuilder } from "@alchemy/aa-accounts";
import { client } from "./base-client.js";

const result = await client.addSessionKey({
  key: "0xSessionKeyAddress",
  tag: "0xkeytag",
  permissions: new SessionKeyPermissionsBuilder().encode(),
});

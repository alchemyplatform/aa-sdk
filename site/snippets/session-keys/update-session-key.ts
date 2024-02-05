import { SessionKeyPermissionsBuilder } from "@alchemy/aa-accounts";
import { client } from "./base-client.js";

const result = await client.updateKeyPermissions({
  // add other permissions to the builder
  args: [
    "0xSessionKeyAddress",
    new SessionKeyPermissionsBuilder()
      .setTimeRange({
        validFrom: Date.now() / 1000,
        // valid for 1 hour
        validUntil: Date.now() / 1000 + 60 * 60,
      })
      .encode(),
  ],
});

import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
import { client } from "./base-client.js";

const result = await client.updateSessionKeyPermissions({
  key: "0xSessionKeyAddress",
  // add other permissions to the builder
  permissions: new SessionKeyPermissionsBuilder()
    .setTimeRange({
      validFrom: Math.round(Date.now() / 1000),
      // valid for 1 hour
      validUntil: Math.round(Date.now() / 1000 + 60 * 60),
    })
    .encode(),
});

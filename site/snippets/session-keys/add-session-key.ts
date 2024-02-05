import { SessionKeyPermissionsBuilder } from "@alchemy/aa-accounts";
import { client } from "./base-client.js";

const result = await client.addSessionKey({
  args: [
    "0xSessionKeyAddress",
    "0xkeytag",
    // you can pass other permissions here by building them up
    new SessionKeyPermissionsBuilder().encode(),
  ],
});

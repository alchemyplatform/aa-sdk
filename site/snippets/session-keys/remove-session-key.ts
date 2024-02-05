import { client } from "./base-client.js";

const result = await client.removeSessionKey({
  key: "0xSessionKeyAddress",
});

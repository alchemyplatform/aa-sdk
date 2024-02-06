import { client } from "./base-client.js";

const result = await client.rotateSessionKey({
  oldKey: "0xOldKey",
  newKey: "0xNewKey",
});

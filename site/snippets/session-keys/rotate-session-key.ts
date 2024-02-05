import { client } from "./base-client.js";

// TODO before GA, we should add a util like we do for remove session key to make this easier
const result = await client.rotateSessionKey({
  args: ["0xOldKey", "0xpredecessor", "0xNewKey"],
});

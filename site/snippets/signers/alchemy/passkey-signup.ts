import { signer } from "./signer";

signer.authenticate({
  type: "passkey",
  createNew: true,
  username: "PASSKEY_NAME",
});

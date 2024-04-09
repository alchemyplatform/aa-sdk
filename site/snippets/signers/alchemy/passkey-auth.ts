import { signer } from "./signer";

signer.authenticate({
  type: "passkey",
  createNew: false,
});

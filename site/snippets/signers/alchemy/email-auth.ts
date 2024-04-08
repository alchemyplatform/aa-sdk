import { signer } from "./signer";

signer.authenticate({
  type: "email",
  bundle: "BUNDLE_IN_URL_FROM_EMAIL_REDIRECT",
});

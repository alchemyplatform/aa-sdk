import type { SmartAccountUser } from "@alchemy/aa-core";
import type { Magic, MagicUserMetadata } from "magic-sdk";

export class MagicUser implements SmartAccountUser<MagicUserMetadata> {
  id: string | undefined;
  inner: Magic;

  constructor(inner: Magic) {
    this.inner = inner;
  }

  initialize = async () => {
    const userId = (await this.inner.user.getInfo()).issuer;
    if (userId == null) throw new Error("No user info found");

    this.id = userId;
  };

  isAuthenticated = async () => {
    if (this.id == null) throw new Error("No user info found");

    return this.inner.user.isLoggedIn();
  };

  getDetails = async () => {
    if (this.id == null) throw new Error("No user info found");

    return this.inner.user.getInfo();
  };
}

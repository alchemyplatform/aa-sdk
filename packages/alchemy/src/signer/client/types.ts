import type { Address, Hex } from "@alchemy/aa-core";
import type { TSignedRequest, getWebAuthnAttestation } from "@turnkey/http";

export type CredentialCreationOptionOverrides = {
  publicKey?: Partial<CredentialCreationOptions["publicKey"]>;
} & Pick<CredentialCreationOptions, "signal">;

export type User = {
  email?: string;
  orgId: string;
  userId: string;
  address: Address;
  credentialId?: string;
};

export type CreateAccountParams =
  | {
      type: "email";
      email: string;
      expirationSeconds?: number;
    }
  | {
      type: "passkey";
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    };

export type EmailAuthParams = {
  email: string;
  expirationSeconds?: number;
  targetPublicKey: string;
};

export type SignerRoutes = SignerEndpoints[number]["Route"];
export type SignerBody<T extends SignerRoutes> = Extract<
  SignerEndpoints[number],
  { Route: T }
>["Body"];
export type SignerResponse<T extends SignerRoutes> = Extract<
  SignerEndpoints[number],
  { Route: T }
>["Response"];

export type SignerEndpoints = [
  {
    Route: "/v1/signup";
    Body:
      | EmailAuthParams
      | {
          passkey: {
            challenge: string;
            attestation: Awaited<ReturnType<typeof getWebAuthnAttestation>>;
          };
        };
    Response: {
      orgId: string;
      userId?: string;
      address?: Address;
    };
  },
  {
    Route: "/v1/whoami";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: User;
  },
  {
    Route: "/v1/auth";
    Body: EmailAuthParams;
    Response: {
      orgId: string;
    };
  },
  {
    Route: "/v1/lookup";
    Body: {
      email: string;
    };
    Response: {
      orgId: string | null;
    };
  },
  {
    Route: "/v1/sign-payload";
    Body: {
      stampedRequest: TSignedRequest;
    };
    Response: {
      signature: Hex;
    };
  }
];

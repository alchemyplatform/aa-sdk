import type { Address, Hex, PartialBy } from "viem";
import type {
  EntryPointVersion,
  RpcUserOperation,
} from "viem/account-abstraction";
import type { Multiplier } from "./actions/types.js";

export type RpcGasAndFeeOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Partial<
  {
    callGasLimit:
      | RpcUserOperation<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    preVerificationGas:
      | RpcUserOperation<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
    verificationGasLimit:
      | RpcUserOperation<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    maxFeePerGas:
      | RpcUserOperation<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | RpcUserOperation<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
  } & ("paymasterPostOpGasLimit" extends keyof RpcUserOperation<TEntryPointVersion>
    ? {
        paymasterPostOpGasLimit:
          | RpcUserOperation<TEntryPointVersion>["paymasterPostOpGasLimit"]
          | Multiplier;
      }
    : {})
>;

export type AlchemyRequestGasAndPaymasterAndDataSchema = {
  Method: "alchemy_requestGasAndPaymasterAndData";
  Parameters: [
    {
      policyId: string | string[];
      entryPoint: Address;
      erc20Context?: {
        tokenAddress: Address;
        permit?: Hex;
        maxTokenAmount?: bigint; // Note: this will be correctly serialized by http transports in viem, but not websocket transports. Not sure if we need to suggest a patch upstream.
      };
      dummySignature: Hex;
      userOperation:
        | PartialBy<
            Pick<
              RpcUserOperation<"0.6">,
              | "sender"
              | "nonce"
              | "callData"
              | "initCode"
              | "callGasLimit"
              | "verificationGasLimit"
              | "maxFeePerGas"
              | "maxPriorityFeePerGas"
              | "preVerificationGas"
              | "eip7702Auth"
            >,
            | "initCode"
            | "callGasLimit"
            | "verificationGasLimit"
            | "maxFeePerGas"
            | "maxPriorityFeePerGas"
            | "preVerificationGas"
            | "eip7702Auth"
          >
        | PartialBy<
            Pick<
              RpcUserOperation<"0.7">,
              | "sender"
              | "nonce"
              | "callData"
              | "factory"
              | "factoryData"
              | "callGasLimit"
              | "verificationGasLimit"
              | "maxFeePerGas"
              | "maxPriorityFeePerGas"
              | "preVerificationGas"
              | "paymasterVerificationGasLimit"
              | "paymasterPostOpGasLimit"
              | "eip7702Auth"
            >,
            | "factory"
            | "factoryData"
            | "callGasLimit"
            | "verificationGasLimit"
            | "maxFeePerGas"
            | "maxPriorityFeePerGas"
            | "preVerificationGas"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
            | "eip7702Auth"
          >;
      overrides?: RpcGasAndFeeOverrides<"0.6"> | RpcGasAndFeeOverrides<"0.7">;
      // todo(v5): add support for state overrides here.
    },
  ];
  ReturnType: Pick<
    RpcUserOperation,
    | "callGasLimit"
    | "verificationGasLimit"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "preVerificationGas"
  > &
    (
      | Required<Pick<RpcUserOperation<"0.6">, "paymasterAndData">>
      | Required<
          Pick<
            RpcUserOperation<"0.7">,
            | "paymaster"
            | "paymasterData"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
          >
        >
    );
};

// Once you've defined this schema, import it into the schema.ts file found in the root alchemy package
export type AlchemyWalletApisRpcSchema = [
  AlchemyRequestGasAndPaymasterAndDataSchema,
];

export type RundlerMaxPriorityFeePerGasSchema = {
  Method: "rundler_maxPriorityFeePerGas";
  Parameters: [];
  ReturnType: RpcUserOperation["maxPriorityFeePerGas"];
};

export type RundlerRpcSchema = [RundlerMaxPriorityFeePerGasSchema];

export type SignerHttpSchema = [
  {
    Route: "signer/v1/auth";
    Method: "POST";
    Body: {
      email?: string;
      emailMode?: "magicLink" | "otp";
      phone?: string;
      targetPublicKey: string;
      expirationSeconds?: number;
      redirectParamas?: string;
      multiFactors?: { multiFactorId: string; multiFactorCode: string }[];
    };
    Response: {
      orgId: string;
      otpId?: string;
      multiFactors?: { multiFactorType: string; multiFactorId: string }[];
    };
  },
  {
    Route: "signer/v1/lookup";
    Method: "POST";
    Body: { email?: string; phone?: string };
    Response: { orgId?: string };
  },
  {
    Route: "signer/v1/otp";
    Method: "POST";
    Body: {
      orgId: string;
      otpId: string;
      otpCode: string;
      targetPublicKey: string;
      expirationSeconds?: number;
    };
    Response: {
      status:
        | "MFA_REQUIRED"
        | "ACCOUNT_LINKING_CONFIRMATION_REQUIRED"
        | "SUCCESS"
        | "FETCHED_ID_TOKEN_ONLY";
      encryptedPayload?: string;
      multiFactors?: { multiFactorType: string; multiFactorId: string }[];
      credentialBundle?: string;
    };
  },
  {
    Route: "signer/v1/prepare-oauth";
    Method: "POST";
    Body: { nonce: string };
    Response: {
      codeChallenge: string;
      requestKey: string;
      authProviders: {
        id: string;
        clientId: string;
        authEndpoint: string;
        isCustomProvider?: boolean;
      }[];
    };
  },
  {
    Route: "signer/v1/whoami";
    Method: "POST";
    Body: StampedRequestBody;
    Response: {
      userId: string;
      orgId: string;
      address: Address;
      email?: string;
      solanaAddress?: string;
    };
  },
  {
    Route: "signer/v1/sign-payload";
    Method: "POST";
    Body: StampedRequestBody;
    Response: { signature: Hex };
  },
  {
    Route: "signer/v1/signup";
    Method: "POST";
    Body: {
      passkey?: PublicKeyCredential;
      email?: string;
      emailMode?: "magicLink" | "otp";
      phone?: string;
      targetPublicKey?: string;
      expirationSeconds?: number;
      redirectParams?: string;
    };
    Response: {
      orgId: string;
      userId?: string;
      address?: Address;
      solanaAddress?: string;
      otpId?: string;
    };
  },
  {
    Route: "signer/v1/add-oauth-provider";
    Method: "POST";
    Body: StampedRequestBody;
    Response: {
      oauthProviders: {
        providerId: string;
        issuer: string;
        providerName?: string;
        userDisplayName?: string;
      }[];
    };
  },
  {
    Route: "signer/v1/remove-oauth-provider";
    Method: "POST";
    Body: StampedRequestBody;
    Response: Record<string, never>; // Empty response object
  },
];

export type StampedRequestBody = {
  stampedRequest: {
    body: string;
    stamp: { stampHeaderName: string; stampHeaderValue: string };
  };
};

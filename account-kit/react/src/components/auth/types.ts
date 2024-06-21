export type AuthType =
  | {
      // TODO: this should support setting redirectParams which will be added to the email redirect
      type: "email";
      hideButton?: boolean;
      buttonLabel?: string;
      placeholder?: string;
    }
  | { type: "passkey" }
  | { type: "injected" };

export type AuthIllustrationStyle = "outline" | "linear" | "filled" | "flat";

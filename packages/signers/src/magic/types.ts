import type {
  MagicSDKAdditionalConfiguration,
  MagicSDKExtensionsOption,
} from "magic-sdk";

export interface MagicAuthParams {
  authenticate: () => Promise<void>;
}

export type MagicSDKParams = {
  apiKey: string;
  options?: MagicSDKAdditionalConfiguration<
    string,
    MagicSDKExtensionsOption<string>
  >;
};

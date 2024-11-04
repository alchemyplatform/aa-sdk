import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

type TStamp = {
  stampHeaderName: string;
  stampHeaderValue: string;
};

export interface Spec extends TurboModule {
  /**
   * Creates an instance of the stamper and returns the public key of TEK
   */
  init(): Promise<string>;

  /**
   * Clears the stored bundle and TEK
   */
  clear(): void;

  /**
   * Returns the public key, or `null` if the stamper isn't properly initialized.
   */
  publicKey(): string | null;

  /**
   * Function to inject a new credential into the iframe
   * The bundle should be encrypted to the stamper's initial public key
   * Encryption should be performed with HPKE (RFC 9180).
   * This is used during recovery and auth flows.
   */
  injectCredentialBundle(bundle: string): Promise<boolean>;

  /**
   * Function to sign a payload with the underlying credential bundle
   * Should throw an error if the bundle was never injected
   */
  stamp(payload: string): Promise<TStamp>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  "NativeTEKStamper"
) as Spec;

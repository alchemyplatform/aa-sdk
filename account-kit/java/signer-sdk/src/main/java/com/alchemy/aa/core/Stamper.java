package com.alchemy.aa.core;

import com.alchemy.aa.client.SignerClient.User;
import com.alchemy.aa.core.exceptions.NoInjectedBundleException;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.crypto.tink.subtle.Base64;
import com.google.crypto.tink.subtle.Hex;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.Security;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import lombok.Getter;
import lombok.Setter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public class Stamper {

  public record Stamp(String stampHeaderName, String stampHeaderValue) {}

  public record APIStamp(String publicKey, String scheme, String signature) {
    public String toJson() throws JsonProcessingException {
      ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
      return ow.writeValueAsString(this);
    }
  }

  private final CredentialBundle credentialBundle;

  public Stamper(CredentialBundle credentialBundle) {
    if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
      Security.addProvider(new BouncyCastleProvider());
    }
    this.credentialBundle = credentialBundle;
  }

  /**
   * Signs the given payload using the stored private key and returns a Stamp.
   *
   * @param payload
   *            payload to sign
   *
   * @return signed stamp
   *
   * @throws GeneralSecurityException
   *             if the private is malformed
   */
  public Stamp stamp(String payload)
    throws GeneralSecurityException, JsonProcessingException {
    if (
      this.credentialBundle.bundlePrivateKey() == null ||
      this.credentialBundle.bundlePublicKey() == null
    ) {
      throw new NoInjectedBundleException();
    }

    // Build the EC private key

    KeyFactory keyFactory = KeyFactory.getInstance("EC");
    PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(
      this.credentialBundle.bundlePrivateKey()
    );
    ECPrivateKey ecPrivateKey = (ECPrivateKey) keyFactory.generatePrivate(
      keySpec
    );

    // Sign with SHA256withECDSA
    Signature signer = Signature.getInstance("SHA256withECDSA", "SunEC");
    signer.initSign(ecPrivateKey);

    signer.update(payload.getBytes());
    byte[] signatureBytes = signer.sign();

    // Prepare the stamp structure
    APIStamp apiStamp = new APIStamp(
      Hex.encode(this.credentialBundle.bundlePublicKey()),
      "SIGNATURE_SCHEME_TK_API_P256",
      Hex.encode(signatureBytes)
    );

    String jsonString = apiStamp.toJson();

    // URL-safe Base64
    String encoded = Base64.urlSafeEncode(jsonString.getBytes());
    return new Stamp("X-Stamp", encoded);
  }
}

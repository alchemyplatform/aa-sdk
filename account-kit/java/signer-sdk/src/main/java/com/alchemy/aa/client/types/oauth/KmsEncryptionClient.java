package com.alchemy.aa.client.types.oauth;

import io.micronaut.context.annotation.Property;
import jakarta.inject.Singleton;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.kms.model.DecryptRequest;
import software.amazon.awssdk.services.kms.model.EncryptRequest;

@Singleton
public class KmsEncryptionClient {

  @Property(name = "oauth-kms-key-id")
  private String kmsKeyId;

  private final KmsClient kmsClient;

  public KmsEncryptionClient() {
    this.kmsClient = KmsClient.create();
  }

  public String encrypt(byte[] plaintext) {
    EncryptRequest encryptRequest = EncryptRequest
      .builder()
      .keyId(kmsKeyId)
      .plaintext(SdkBytes.fromByteArray(plaintext))
      .build();
    try {
      SdkBytes ciphertext = kmsClient.encrypt(encryptRequest).ciphertextBlob();
      return encodeBase64Url(ciphertext.asByteArray());
    } catch (Exception e) {
      throw new RuntimeException("Failed to encrypt data with KMS: " + e);
    }
  }

  public byte[] decrypt(String ciphertext) {
    byte[] ciphertextBytes = java.util.Base64
      .getUrlDecoder()
      .decode(ciphertext);
    DecryptRequest decryptRequest = DecryptRequest
      .builder()
      .ciphertextBlob(SdkBytes.fromByteArray(ciphertextBytes))
      .build();
    try {
      SdkBytes plaintext = kmsClient.decrypt(decryptRequest).plaintext();
      return plaintext.asByteArray();
    } catch (Exception e) {
      throw new RuntimeException("Failed to decrypt data with KMS: " + e);
    }
  }

  private String encodeBase64Url(byte[] input) {
    return java.util.Base64
      .getUrlEncoder()
      .withoutPadding()
      .encodeToString(input);
  }
}

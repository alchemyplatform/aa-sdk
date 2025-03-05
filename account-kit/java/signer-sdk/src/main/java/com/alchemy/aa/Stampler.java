package com.alchemy.aa;

import com.alchemy.aa.core.TEKManager;
import com.alchemy.aa.core.Utilities;
import com.alchemy.aa.core.exceptions.NoInjectedBundleException;
import com.alchemy.aa.core.exceptions.StamperNotInitializedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.primitives.Bytes;
import com.google.crypto.tink.subtle.Base64;
import com.google.crypto.tink.subtle.EllipticCurves;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.Signature;
import java.util.Locale;
import org.bitcoinj.base.Base58;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECPublicKeySpec;

public class Stampler {

  public record Stamp(
      String stampHeaderName,
      String stampHeaderValue
  ){}

  public record APIStamp(
      String publicKey,
      String scheme,
      String signature
  ){}

  public static String toJson( APIStamp apiStamp ) throws JsonProcessingException {
    ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
    return ow.writeValueAsString(apiStamp);
  }

  private TEKManager tekManager;

  private char[] bundlePrivateKey;
  private char[] bundlePublicKey;
  public Stampler(TEKManager tekManager) {
    this.tekManager = tekManager;
    this.bundlePublicKey = null;
    this.bundlePrivateKey = null;
  }

  /**
   * Creates a new TEK via HpkeTEKManager or returns the existing one
   * @return TEK public key
   */
  public String initTek(){
      byte[] tekPublicKeyBytes = this.tekManager.createTEK().getPublicKeyBytes().toByteArray();
      return Utilities.bytesToHex(tekPublicKeyBytes);

  }


  /** Injects a credential bundle (Base58-encoded) after decrypting.
   * @param bundle Base58-encoded credential bundle
   * @throws GeneralSecurityException iif initTek is never called.
   */
  public void injectCredentialBundle(String bundle) throws GeneralSecurityException {
    // In Kotlin: val tekPublicKey = tekManager.publicKey() ?: throw StamperNotInitializedException()
    if (tekManager.getPublicKey() == null) {
      throw new StamperNotInitializedException();
    }
    // TEK public key in raw bytes
    byte[] tekPublicKeyBytes = tekManager.getPublicKey().getPublicKeyBytes().toByteArray();

    // Decode bundle from Base58 (with checksum)
    byte[] decodedBundle = Base58.decodeChecked(bundle);
    ByteBuffer buffer = ByteBuffer.wrap(decodedBundle);

    // ephemeralPublicKey (33 bytes, compressed)
    int ephemeralPublicKeyLength = 33;
    byte[] ephemeralPublicKeyBytes = new byte[ephemeralPublicKeyLength];
    buffer.get(ephemeralPublicKeyBytes);

    // Convert ephemeral public key into uncompressed form
    byte [] ephemeralPublicKeyUncompressed = EllipticCurves.getEcPublicKey(
        EllipticCurves.CurveType.NIST_P256,
        EllipticCurves.PointFormatType.UNCOMPRESSED,
        ephemeralPublicKeyBytes
    ).getEncoded();


    // Remaining bytes are the ciphertext
    byte[] ciphertext = new byte[buffer.remaining()];
    buffer.get(ciphertext);

    // The AAD is ephemeralPublicKeyUncompressed + TEK public key
    byte[] aad = Bytes.concat(ephemeralPublicKeyUncompressed, tekPublicKeyBytes);

    // Perform HPKE decryption
    byte[] decryptedKey = tekManager.hpkeDecrypt(
        ephemeralPublicKeyUncompressed,
        ciphertext,
        "turnkey_hpke".getBytes(),
        aad
    );

    // Split out the privateKey/publicKey from the decrypted bytes
    byte[][] keyPair = privateKeyToKeyPair(decryptedKey);
    byte[] publicKeyBytes = keyPair[0];
    byte[] privateKeyBytes = keyPair[1];

    // Store them, as hex in lowercase
    this.bundlePrivateKey = Utilities.bytesToHex(privateKeyBytes).toLowerCase(Locale.ROOT).toCharArray();
    this.bundlePublicKey = Utilities.bytesToHex(publicKeyBytes).toLowerCase(Locale.ROOT).toCharArray();
  }

  /** Split out the privateKey/publicKey from the decrypted bytes
   * @param privateKey
   * @return byte struct key pairs.
   */
  private byte[][] privateKeyToKeyPair(byte[] privateKey) {
    try {
      // Create the EC private key
      ECPrivateKey ecPrivateKey = EllipticCurves.getEcPrivateKey(EllipticCurves.CurveType.NIST_P256, privateKey);

      // Use BouncyCastle to derive the public key
      // Multiply base point G by the private scalar s
      java.math.BigInteger s = ecPrivateKey.getS();
      org.bouncycastle.jce.spec.ECParameterSpec bcSpec = ECNamedCurveTable.getParameterSpec("secp256r1");
      ECPublicKeySpec pubSpec = new ECPublicKeySpec(bcSpec.getG().multiply(s).normalize(), bcSpec);
      KeyFactory keyFactory = KeyFactory.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);

      // Convert the result into Tink's EcPublicKey format
      ECPublicKey ecPublicKey = EllipticCurves.getEcPublicKey(EllipticCurves.CurveType.NIST_P256,
          EllipticCurves.PointFormatType.COMPRESSED, keyFactory.generatePublic(pubSpec).getEncoded());

      // Validate they match
      EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey);

      // Compress the public key to match Turnkey's expectation
      byte[] compressedPublicKey = ecPublicKey.getEncoded();

      // Return both
      return new byte[][] {compressedPublicKey, privateKey};

    } catch (Exception e) {
      throw new RuntimeException("Error deriving public key from private key", e);
    }
  }

  /**
   * Signs the given payload using the stored private key and returns a Stamp.
   * @param payload payload to sign
   * @return signed stamp
   * @throws GeneralSecurityException iif the private is malformed
   */
  public Stamp stamp(String payload) throws GeneralSecurityException {
    if (this.bundlePrivateKey == null || this.bundlePublicKey == null) {
      throw new NoInjectedBundleException();
    }
    // Retrieve the private key from shared prefs
    String signingKeyHex = String.valueOf(this.bundlePrivateKey);
    String publicSigningKeyHex = String.valueOf(this.bundlePublicKey);



    byte[] privateKeyBytes = Utilities.HexToBytes(signingKeyHex);

    // Build the EC private key
    ECPrivateKey ecPrivateKey = EllipticCurves.getEcPrivateKey(
        EllipticCurves.CurveType.NIST_P256,
        privateKeyBytes
    );

    // Sign with SHA256withECDSA
    try {
      Signature signer = Signature.getInstance("SHA256withECDSA");
      signer.initSign(ecPrivateKey);
      signer.update(payload.getBytes());
      byte[] signatureBytes = signer.sign();

      // Prepare the stamp structure
      APIStamp apiStamp = new APIStamp(
          publicSigningKeyHex,
          "SIGNATURE_SCHEME_TK_API_P256",
          Utilities.bytesToHex(signatureBytes)
      );

      String jsonString = toJson(apiStamp);

      // URL-safe Base64
      String encoded = Base64.urlSafeEncode(jsonString.getBytes());
      return new Stamp("X-Stamp", encoded);

    } catch (Exception e) {
      throw new RuntimeException("Error signing payload", e);
    }
  }


  /**
   * Get TEK public key
   * @return Tek public key
   */
  public String publicKey() {
    return tekManager.getPublicKey().toString();
  }

}

package com.alchemy.aa.core;

import com.google.common.primitives.Bytes;
import com.google.crypto.tink.subtle.EllipticCurves;
import com.google.protobuf.InvalidProtocolBufferException;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.Security;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECPoint;
import org.bitcoinj.base.Base58;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECPublicKeySpec;

/**
 * a credential bundle form kms. used by stamper to stamp message
 * @param bundlePrivateKey deciphered private key from bundle
 * @param bundlePublicKey deciphered public key from bundle
 */
public record CredentialBundle(
  byte[] bundlePrivateKey,
  byte[] bundlePublicKey
) {
  /// Private key deciphered from bundle.

  /// Public key from bundle.

  /**
   * create a credential bundle (Base58-encoded) with encrypted bundle.
   *
   * @param bundle
   *            Base58-encoded credential bundle
   * @param tekManager
   *            turnkey manager to decipher bundle
   * @return deciphered credential bundle
   * @throws GeneralSecurityException
   *             if you use the wrong key to decipher bundle
   */
  public static CredentialBundle fromEncryptedBundle(
    String bundle,
    TekManager tekManager
  ) throws GeneralSecurityException, InvalidProtocolBufferException {
    if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
      Security.addProvider(new BouncyCastleProvider());
    }

    // TEK public key in raw bytes
    byte[] tekPublicKeyBytes = tekManager
      .getPublicKey()
      .getPublicKeyBytes()
      .toByteArray();

    // Decode bundle from Base58 (with checksum)

    byte[] decodedBundle = Base58.decodeChecked(bundle);

    ByteBuffer buffer = ByteBuffer.wrap(decodedBundle);

    // ephemeralPublicKey (33 bytes, compressed)
    int ephemeralPublicKeyLength = 33;
    byte[] ephemeralPublicKeyBytes = new byte[ephemeralPublicKeyLength];
    buffer.get(ephemeralPublicKeyBytes);

    byte[] ephemeralPublicKeyUncompressed = convertToUncompress(
      ephemeralPublicKeyBytes
    );

    // Remaining bytes are the ciphertext
    byte[] ciphertext = new byte[buffer.remaining()];
    buffer.get(ciphertext);

    // The AAD is ephemeralPublicKeyUncompressed + TEK public key
    byte[] aad = Bytes.concat(
      ephemeralPublicKeyUncompressed,
      tekPublicKeyBytes
    );

    // Perform HPKE decryption
    byte[] decryptedKey = tekManager.hpkeDecrypt(
      ephemeralPublicKeyUncompressed,
      ciphertext,
      "turnkey_hpke".getBytes(),
      aad
    );

    byte[][] keys = privateKeyToKeyPair(decryptedKey);
    // Split out the privateKey/publicKey from the decrypted bytes
    return new CredentialBundle(keys[1], keys[0]);
  }

  private static byte[] convertToUncompress(byte[] compressedPubKeyBytes)
    throws GeneralSecurityException {
    EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
    ECPoint ecPoint = EllipticCurves.pointDecode(
      curveType,
      EllipticCurves.PointFormatType.COMPRESSED,
      compressedPubKeyBytes
    );
    return EllipticCurves.pointEncode(
      curveType,
      EllipticCurves.PointFormatType.UNCOMPRESSED,
      ecPoint
    );
  }

  private static byte[] convertToCompressed(byte[] PubKeyBytes)
    throws GeneralSecurityException {
    EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
    ECPoint ecPoint = EllipticCurves.pointDecode(
      curveType,
      EllipticCurves.PointFormatType.UNCOMPRESSED,
      PubKeyBytes
    );
    return EllipticCurves.pointEncode(
      curveType,
      EllipticCurves.PointFormatType.COMPRESSED,
      ecPoint
    );
  }

  private static byte[] convertToCompressed(ECPublicKey ecPublicKey)
    throws GeneralSecurityException {
    return EllipticCurves.pointEncode(
      ecPublicKey.getParams().getCurve(),
      EllipticCurves.PointFormatType.COMPRESSED,
      ecPublicKey.getW()
    );
  }

  /**
   * Split out the privateKey/publicKey from the decrypted bytes
   *
   * @param privateKey
   *
   * @return byte struct key pairs.
   */
  private static byte[][] privateKeyToKeyPair(byte[] privateKey)
    throws GeneralSecurityException {
    // Create the EC private key

    ECPrivateKey ecPrivateKey = EllipticCurves.getEcPrivateKey(
      EllipticCurves.CurveType.NIST_P256,
      privateKey
    );

    // Use BouncyCastle to derive the public key
    // Multiply base point G by the private scalar s
    java.math.BigInteger s = ecPrivateKey.getS();
    org.bouncycastle.jce.spec.ECParameterSpec bcSpec =
      ECNamedCurveTable.getParameterSpec("secp256r1");
    ECPublicKeySpec pubSpec = new ECPublicKeySpec(
      bcSpec.getG().multiply(s).normalize(),
      bcSpec
    );
    KeyFactory keyFactory = KeyFactory.getInstance(
      "EC",
      BouncyCastleProvider.PROVIDER_NAME
    );

    // Convert the result into Tink's EcPublicKey format
    ECPublicKey ecPublicKey = EllipticCurves.getEcPublicKey(
      keyFactory.generatePublic(pubSpec).getEncoded()
    );

    // Validate they match
    EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey);

    // Return both
    return new byte[][] {
      convertToCompressed(ecPublicKey),
      ecPrivateKey.getEncoded(),
    };
  }
}

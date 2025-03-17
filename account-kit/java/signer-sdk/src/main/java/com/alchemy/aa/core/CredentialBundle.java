package com.alchemy.aa.core;

import com.alchemy.aa.core.exceptions.StamperNotInitializedException;
import com.google.common.primitives.Bytes;
import com.google.crypto.tink.subtle.EllipticCurves;
import com.google.protobuf.InvalidProtocolBufferException;
import java.io.Serializable;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.Security;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECPoint;
import lombok.Getter;
import org.bitcoinj.base.Base58;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECPublicKeySpec;

public class CredentialBundle implements Serializable {

    /// Private key deciphered from bundle.
    @Getter
    private byte[] bundlePrivateKey;

    /// Public key from bundle.
    @Getter
    private byte[] bundlePublicKey;

    private CredentialBundle(TekManager tekManager) {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    /**
     * Injects a credential bundle (Base58-encoded) after decrypting.
     *
     * @param bundle
     *            Base58-encoded credential bundle
     *
     * @throws GeneralSecurityException
     *             if initTek is never called.
     */
    public static CredentialBundle injectCredentialBundle(String bundle, TekManager tekManager)
            throws GeneralSecurityException, InvalidProtocolBufferException {
        CredentialBundle credentialBundle = new CredentialBundle(tekManager);
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

        byte[] ephemeralPublicKeyUncompressed = convertToUncompress(ephemeralPublicKeyBytes);

        // Remaining bytes are the ciphertext
        byte[] ciphertext = new byte[buffer.remaining()];
        buffer.get(ciphertext);

        // The AAD is ephemeralPublicKeyUncompressed + TEK public key
        byte[] aad = Bytes.concat(ephemeralPublicKeyUncompressed, tekPublicKeyBytes);

        // Perform HPKE decryption
        byte[] decryptedKey = tekManager.hpkeDecrypt(ephemeralPublicKeyUncompressed, ciphertext,
                "turnkey_hpke".getBytes(), aad);

        byte[][] keys = privateKeyToKeyPair(decryptedKey);
        // Split out the privateKey/publicKey from the decrypted bytes
        credentialBundle.bundlePublicKey = keys[0];
        credentialBundle.bundlePrivateKey = keys[1];
        return credentialBundle;
    }

    private static byte[] convertToUncompress(byte[] compressedPubKeyBytes) throws GeneralSecurityException {
        EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
        ECPoint ecPoint = EllipticCurves.pointDecode(curveType, EllipticCurves.PointFormatType.COMPRESSED,
                compressedPubKeyBytes);
        return EllipticCurves.pointEncode(curveType, EllipticCurves.PointFormatType.UNCOMPRESSED, ecPoint);
    }

    private static byte[] convertToCompressed(byte[] PubKeyBytes) throws GeneralSecurityException {
        EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
        ECPoint ecPoint = EllipticCurves.pointDecode(curveType, EllipticCurves.PointFormatType.UNCOMPRESSED,
                PubKeyBytes);
        return EllipticCurves.pointEncode(curveType, EllipticCurves.PointFormatType.COMPRESSED, ecPoint);
    }

    private static byte[] convertToCompressed(ECPublicKey ecPublicKey) throws GeneralSecurityException {
        return EllipticCurves.pointEncode(ecPublicKey.getParams().getCurve(), EllipticCurves.PointFormatType.COMPRESSED,
                ecPublicKey.getW());
    }

    /**
     * Split out the privateKey/publicKey from the decrypted bytes
     *
     * @param privateKey
     *
     * @return byte struct key pairs.
     */
    private static byte[][] privateKeyToKeyPair(byte[] privateKey) throws GeneralSecurityException {
        // Create the EC private key

        ECPrivateKey ecPrivateKey = EllipticCurves.getEcPrivateKey(EllipticCurves.CurveType.NIST_P256, privateKey);

        // Use BouncyCastle to derive the public key
        // Multiply base point G by the private scalar s
        java.math.BigInteger s = ecPrivateKey.getS();
        org.bouncycastle.jce.spec.ECParameterSpec bcSpec = ECNamedCurveTable.getParameterSpec("secp256r1");
        ECPublicKeySpec pubSpec = new ECPublicKeySpec(bcSpec.getG().multiply(s).normalize(), bcSpec);
        KeyFactory keyFactory = KeyFactory.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME);

        // Convert the result into Tink's EcPublicKey format
        ECPublicKey ecPublicKey = EllipticCurves.getEcPublicKey(keyFactory.generatePublic(pubSpec).getEncoded());

        // Validate they match
        EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey);

        // Return both
        return new byte[][] { convertToCompressed(ecPublicKey), ecPrivateKey.getEncoded() };
    }
}

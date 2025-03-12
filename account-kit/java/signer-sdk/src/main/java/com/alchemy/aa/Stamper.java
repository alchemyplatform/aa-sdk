package com.alchemy.aa;

import com.alchemy.aa.core.TEKManager;
import com.alchemy.aa.core.exceptions.NoInjectedBundleException;
import com.alchemy.aa.core.exceptions.StamperNotInitializedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.primitives.Bytes;
import com.google.crypto.tink.subtle.Base64;
import com.google.crypto.tink.subtle.EllipticCurves;
import com.google.crypto.tink.subtle.Hex;
import com.google.protobuf.InvalidProtocolBufferException;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.Security;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECPoint;
import org.bitcoinj.base.Base58;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECPublicKeySpec;

public class Stamper {

    public record Stamp(String stampHeaderName, String stampHeaderValue) {
    }

    public record APIStamp(String publicKey, String scheme, String signature) {
    }

    public static String toJson(APIStamp apiStamp) throws JsonProcessingException {
        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
        return ow.writeValueAsString(apiStamp);
    }

    public Stamper(TEKManager tekManager) {
        this();

        this.tekManager = tekManager;
    }

    private Stamper() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        this.bundlePublicKey = null;
        this.bundlePrivateKey = null;
    }

    /**
     * Injects a credential bundle (Base58-encoded) after decrypting.
     *
     * @param bundle
     *            Base58-encoded credential bundle
     *
     * @throws GeneralSecurityException
     *             iif initTek is never called.
     */
    public void injectCredentialBundle(String bundle) throws GeneralSecurityException, InvalidProtocolBufferException {
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
        this.bundlePublicKey = keys[1];
        this.bundlePrivateKey = keys[0];
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
     *             iif the private is malformed
     */
    public Stamp stamp(String payload) throws GeneralSecurityException {
        if (this.bundlePrivateKey == null || this.bundlePublicKey == null) {
            throw new NoInjectedBundleException();
        }

        // Build the EC private key
        ECPrivateKey ecPrivateKey = EllipticCurves.getEcPrivateKey(EllipticCurves.CurveType.NIST_P256,
                this.bundlePrivateKey);

        // Sign with SHA256withECDSA
        try {
            Signature signer = Signature.getInstance("SHA256withECDSA");
            signer.initSign(ecPrivateKey);
            signer.update(payload.getBytes());
            byte[] signatureBytes = signer.sign();

            // Prepare the stamp structure
            APIStamp apiStamp = new APIStamp(String.valueOf(this.bundlePublicKey), "SIGNATURE_SCHEME_TK_API_P256",
                    Hex.encode(signatureBytes));

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
     *
     * @return Tek public key
     */
    public String publicKey() throws GeneralSecurityException, InvalidProtocolBufferException {
        return tekManager.getPublicKey().toString();
    }

    private byte[] convertToUncompress(byte[] compressedPubKeyBytes) throws GeneralSecurityException {
        EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
        ECPoint ecPoint = EllipticCurves.pointDecode(curveType, EllipticCurves.PointFormatType.COMPRESSED,
                compressedPubKeyBytes);
        return EllipticCurves.pointEncode(curveType, EllipticCurves.PointFormatType.UNCOMPRESSED, ecPoint);
    }

    private byte[] convertToCompressed(ECPublicKey ecPublicKey) throws GeneralSecurityException {
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
    private byte[][] privateKeyToKeyPair(byte[] privateKey) throws GeneralSecurityException {
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
            ECPublicKey ecPublicKey = EllipticCurves.getEcPublicKey(keyFactory.generatePublic(pubSpec).getEncoded());

            // Validate they match
            EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey);
            // Return both
            return new byte[][] { convertToCompressed(ecPublicKey), ecPrivateKey.getEncoded() };
        } catch (Exception e) {
            throw e;
        }
    }

    private TEKManager tekManager;

    private byte[] bundlePrivateKey;
    private byte[] bundlePublicKey;

}

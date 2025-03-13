package com.alchemy.aa;

import com.alchemy.aa.core.TekManager;
import com.alchemy.aa.core.exceptions.NoInjectedBundleException;
import com.alchemy.aa.core.exceptions.StamperNotInitializedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.primitives.Bytes;
import com.google.crypto.tink.InsecureSecretKeyAccess;
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
import java.security.spec.PKCS8EncodedKeySpec;
import org.bitcoinj.base.Base58;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECPublicKeySpec;

public class Stamper {

    public record Stamp(String stampHeaderName, String stampHeaderValue) {
    }

    public record APIStamp(String publicKey, String scheme, String signature) {

        public String toJson(ObjectMapper mapper) throws JsonProcessingException {
            return mapper.writeValueAsString(this);
        }
    }

    private TekManager tekManager;
    private ObjectMapper mapper;
    private byte[] bundlePrivateKey;
    private byte[] bundlePublicKey;

    public Stamper(TekManager tekManager) {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        this.bundlePublicKey = null;
        this.bundlePrivateKey = null;
        this.mapper = new ObjectMapper();

        this.tekManager = tekManager;
    }

    /**
     * Injects a credential bundle (Base58-encoded) after decrypting.
     *
     * @param bundle
     *            Base58-encoded credential bundle
     *
     * @throws GeneralSecurityException
     *             if Tek failed to parse bundle.
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
        this.bundlePublicKey = keys[0];
        this.bundlePrivateKey = keys[1];
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
    public synchronized Stamp stamp(String payload) throws GeneralSecurityException, JsonProcessingException {
        if (this.bundlePrivateKey == null || this.bundlePublicKey == null) {
            throw new NoInjectedBundleException();
        }

        // Build the EC private key

        KeyFactory keyFactory = KeyFactory.getInstance("EC");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(this.bundlePrivateKey);
        ECPrivateKey ecPrivateKey = (ECPrivateKey) keyFactory.generatePrivate(keySpec);

        // Sign with SHA256withECDSA
        Signature signer = Signature.getInstance("SHA256withECDSA", "SunEC");
        signer.initSign(ecPrivateKey);

        signer.update(payload.getBytes());
        byte[] signatureBytes = signer.sign();

        // Prepare the stamp structure
        APIStamp apiStamp = new APIStamp(Hex.encode(this.bundlePublicKey), "SIGNATURE_SCHEME_TK_API_P256",
                Hex.encode(signatureBytes));

        String jsonString = apiStamp.toJson(mapper);

        // URL-safe Base64
        String encoded = Base64.urlSafeEncode(jsonString.getBytes());
        return new Stamp("X-Stamp", encoded);
    }

    /**
     * Get Tek public key
     *
     * @return Tek public key
     */
    public String publicKey() throws GeneralSecurityException, InvalidProtocolBufferException {
        return org.bouncycastle.util.encoders.Hex
                .toHexString(tekManager.getPublicKey().getPublicKeyBytes().toByteArray());
    }

    public String privateKey() throws GeneralSecurityException, InvalidProtocolBufferException {
        return org.bouncycastle.util.encoders.Hex.toHexString(
                tekManager.getPrivateKey().getPrivateKeyBytes().toByteArray(InsecureSecretKeyAccess.get()));
    }

    private byte[] convertToUncompress(byte[] compressedPubKeyBytes) throws GeneralSecurityException {
        EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
        ECPoint ecPoint = EllipticCurves.pointDecode(curveType, EllipticCurves.PointFormatType.COMPRESSED,
                compressedPubKeyBytes);
        return EllipticCurves.pointEncode(curveType, EllipticCurves.PointFormatType.UNCOMPRESSED, ecPoint);
    }

    private byte[] convertToCompressed(byte[] PubKeyBytes) throws GeneralSecurityException {
        EllipticCurves.CurveType curveType = EllipticCurves.CurveType.NIST_P256;
        ECPoint ecPoint = EllipticCurves.pointDecode(curveType, EllipticCurves.PointFormatType.UNCOMPRESSED,
                PubKeyBytes);
        return EllipticCurves.pointEncode(curveType, EllipticCurves.PointFormatType.COMPRESSED, ecPoint);
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

package com.accountkit.reactnativesigner

import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.google.crypto.tink.BinaryKeysetWriter
import com.google.crypto.tink.CleartextKeysetHandle
import com.google.crypto.tink.InsecureSecretKeyAccess
import com.google.crypto.tink.KeyTemplate
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.TinkJsonProtoKeysetFormat
import com.google.crypto.tink.config.TinkConfig
import com.google.crypto.tink.hybrid.HpkeParameters
import com.google.crypto.tink.hybrid.HpkePrivateKey
import com.google.crypto.tink.hybrid.internal.HpkeContext
import com.google.crypto.tink.hybrid.internal.HpkeKemKeyFactory
import com.google.crypto.tink.hybrid.internal.HpkePrimitiveFactory
import com.google.crypto.tink.proto.HpkePublicKey
import com.google.crypto.tink.subtle.Base64
import com.google.crypto.tink.subtle.EllipticCurves
import com.google.crypto.tink.util.Bytes
import com.google.crypto.tink.util.SecretBytes
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.bitcoinj.core.Base58
import org.bouncycastle.jce.ECNamedCurveTable
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.jce.spec.ECPublicKeySpec
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.security.KeyFactory
import java.security.Security
import java.security.Signature
import java.security.interfaces.ECPublicKey
import javax.xml.bind.DatatypeConverter


@Serializable
data class ApiStamp(val publicKey: String, val scheme: String, val signature: String)

@ReactModule(name = NativeTEKStamperModule.NAME)
class NativeTEKStamperModule(reactContext: ReactApplicationContext) :
    NativeTEKStamperSpec(reactContext) {

    private val TEK_STORAGE_KEY = "TEK_STORAGE_KEY"
    private val BUNDLE_PRIVATE_KEY = "BUNDLE_PRIVATE_KEY"
    private val BUNDLE_PUBLIC_KEY = "BUNDLE_PUBLIC_KEY"
    private val context = reactContext

    // This is how the docs for EncryptedSharedPreferences recommend creating this setup
    private val masterKey = MasterKey.Builder(context.applicationContext)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .setUserAuthenticationRequired(false)
        .build();

    /**
     * We are using EncryptedSharedPreferences to store 2 pieces of data
     * 1. the TEK keypair - this is the ephemeral key-pair that Turnkey will use
     * to encrypt the bundle with
     * 2. the decrypted private key for a session
     *
     * The reason we are not using the android key store for either of these things is because
     * 1. For us to be able to import the private key in the bundle into the KeyStore, Turnkey
     * has to return the key in a different format (AFAIK): https://developer.android.com/privacy-and-security/keystore#ImportingEncryptedKeys
     * 2. If we store the TEK in the KeyStore, then we have to roll our own HPKE decrypt function
     * as there's no off the shelf solution (that I could find) to do the HPKE decryption. Rolling our own
     * decryption feels wrong given we are not experts on this and don't have a good way to verify our
     * implementation (and I don't trust the ChatGPT output to be correct. Even if it is, there's no
     * guarantee we can test all the edge cases since those are unknown unknowns)
     *
     * NOTE: this isn't too far off from how Turnkey recommends doing it in Swift
     * https://github.com/tkhq/swift-sdk/blob/5817374a7cbd4c99b7ea90b170363dc2bf6c59b9/docs/email-auth.md#email-authentication
     *
     * The open question is if the storage of the decrypted private key is secure enough though
     */
    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "tek_stamper_shared_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // This allows us to do the HPKE decryption of the bundle
    private val hpkeParams = HpkeParameters.builder()
        .setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
        .setKdfId(HpkeParameters.KdfId.HKDF_SHA256)
        .setAeadId(HpkeParameters.AeadId.AES_256_GCM)
        .setVariant(HpkeParameters.Variant.NO_PREFIX)
        .build()

    init {
        TinkConfig.register()

        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME).javaClass != BouncyCastleProvider::class.java) {
            Security.removeProvider(BouncyCastleProvider.PROVIDER_NAME)
        }

        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(BouncyCastleProvider())
        }
    }

    override fun getName(): String {
        return NAME
    }

    override fun init(promise: Promise) {
        try {
            val existingPublicKey = publicKey()
            if (existingPublicKey != null) {
                return promise.resolve(existingPublicKey)
            }

            // Generate a P256 key
            val keyHandle = KeysetHandle.generateNew(KeyTemplate.createFrom(hpkeParams))

            // Store the ephemeral key in encrypted shared preferences
            sharedPreferences
                .edit()
                .putString(
                    TEK_STORAGE_KEY,
                    TinkJsonProtoKeysetFormat.serializeKeyset(
                        keyHandle,
                        InsecureSecretKeyAccess.get()
                    )
                )
                .apply()

            return promise.resolve(tekPublicKeyHex(keyHandle))
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun clear() {
        sharedPreferences.edit().clear().apply()
    }

    override fun publicKey(): String? {
        val existingHandle = getRecipientKeyHandle() ?: return null

        return tekPublicKeyHex(existingHandle)
    }

    override fun injectCredentialBundle(bundle: String, promise: Promise) {
        try {
            val tekHandle = getRecipientKeyHandle()
                ?: return promise.reject(Exception("Stamper has not been initialized"))

            val decodedBundle = Base58.decodeChecked(bundle)
            val buffer = ByteBuffer.wrap(decodedBundle)
            val ephemeralPublicKeyLength = 33
            val ephemeralPublicKeyBytes = ByteArray(ephemeralPublicKeyLength)
            buffer.get(ephemeralPublicKeyBytes)
            val ephemeralPublicKey = EllipticCurves.getEcPublicKey(
                EllipticCurves.CurveType.NIST_P256,
                EllipticCurves.PointFormatType.COMPRESSED,
                ephemeralPublicKeyBytes,
            )
            val uncompressedEphemeralKey = convertToUncompressedPublicKeyBytes(ephemeralPublicKey)

            val ciphertext = ByteArray(buffer.remaining())
            buffer.get(ciphertext)

            val aad = uncompressedEphemeralKey + DatatypeConverter.parseHexBinary(
                tekPublicKeyHex(tekHandle)
            )

            // Why do we hve to do all this rather than doing:
            // val hybridDecrypt = tekHandle.getPrimitive(HybridDecrypt::class.java)
            // val decryptedKey = hybridDecrypt.decrypt(ciphertext, "turnkey_hpke".toByteArray())
            // the hybridDecrypt.decrypt that google exposes doesn't allow us to pass in
            // the aad that's needed to complete decryption
            val recipient = HpkeContext.createRecipientContext(
                convertToUncompressedPublicKeyBytes(ephemeralPublicKey),
                HpkeKemKeyFactory.createPrivate(getHpkePrivateKeyFromKeysetHandle(tekHandle)),
                HpkePrimitiveFactory.createKem(hpkeParams.kemId),
                HpkePrimitiveFactory.createKdf(hpkeParams.kdfId),
                HpkePrimitiveFactory.createAead(hpkeParams.aeadId),
                "turnkey_hpke".toByteArray()
            )

            val decryptedKey = recipient.open(ciphertext, aad)

            val (publicKeyBytes, privateKeyBytes) = privateKeyToKeyPair(decryptedKey)

            sharedPreferences.edit()
                .putString(
                    BUNDLE_PRIVATE_KEY,
                    DatatypeConverter.printHexBinary(privateKeyBytes).lowercase()
                )
                .apply()

            sharedPreferences.edit()
                .putString(
                    BUNDLE_PUBLIC_KEY,
                    DatatypeConverter.printHexBinary(publicKeyBytes).lowercase()
                )
                .apply()

            return promise.resolve(true)
        } catch (e: Exception) {
            Log.e("error", "an error happened", e)
            promise.reject(e)
        }
    }

    override fun stamp(payload: String, promise: Promise) {
        try {
            val signingKeyHex = sharedPreferences.getString(BUNDLE_PRIVATE_KEY, null)
                ?: return promise.reject(Exception("No injected bundle, did you complete auth?"))

            val publicSigningKeyHex =
                sharedPreferences.getString(BUNDLE_PUBLIC_KEY, null) ?: return promise.reject(
                    Exception("No injected bundle, did you complete auth?")
                )

            val ecPrivateKey = EllipticCurves.getEcPrivateKey(
                EllipticCurves.CurveType.NIST_P256,
                DatatypeConverter.parseHexBinary(signingKeyHex)
            )

            val signer = Signature.getInstance("SHA256withECDSA")
            signer.initSign(ecPrivateKey)
            signer.update(payload.toByteArray())
            val signature = signer.sign()

            val apiStamp = ApiStamp(
                publicSigningKeyHex,
                "SIGNATURE_SCHEME_TK_API_P256",
                DatatypeConverter.printHexBinary(signature)
            )

            val stamp = Arguments.createMap()
            stamp.putString("stampHeaderName", "X-Stamp")
            stamp.putString(
                "stampHeaderValue",
                Base64.urlSafeEncode(Json.encodeToString(apiStamp).toByteArray())
            )
            return promise.resolve(stamp)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private fun getRecipientKeyHandle(): KeysetHandle? {
        if (!sharedPreferences.contains(TEK_STORAGE_KEY)) {
            return null;
        }

        return TinkJsonProtoKeysetFormat.parseKeyset(
            sharedPreferences.getString(
                TEK_STORAGE_KEY,
                null
            ),
            InsecureSecretKeyAccess.get()
        )
    }

    private fun privateKeyToKeyPair(privateKey: ByteArray): Pair<ByteArray, ByteArray> {
        val ecPrivateKey = EllipticCurves.getEcPrivateKey(
            EllipticCurves.CurveType.NIST_P256,
            privateKey
        )

        // compute the public key
        val s = ecPrivateKey.s
        val bcSpec = ECNamedCurveTable.getParameterSpec("secp256r1")
        val pubSpec = ECPublicKeySpec(bcSpec.g.multiply(s).normalize(), bcSpec)
        val keyFactory =
            KeyFactory.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME)

        val ecPublicKey = EllipticCurves.getEcPublicKey(keyFactory.generatePublic(pubSpec).encoded)

        // verify the key pair
        EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey)

        // compress it to match turnkey expectations
        val compressedPublicKey = EllipticCurves.pointEncode(
            EllipticCurves.CurveType.NIST_P256,
            EllipticCurves.PointFormatType.COMPRESSED,
            ecPublicKey.w
        )
        return Pair(compressedPublicKey, privateKey)
    }

    private fun tekPublicKeyHex(keyHandle: KeysetHandle): String {
        val keySet = CleartextKeysetHandle.getKeyset(keyHandle.publicKeysetHandle)
        val hpkePublicKey = HpkePublicKey.parseFrom(keySet.keyList[0].keyData.value)

        val publicKeyBytes = hpkePublicKey.publicKey.toByteArray()
        return DatatypeConverter.printHexBinary(publicKeyBytes)
    }

    private fun getHpkePrivateKeyFromKeysetHandle(keysetHandle: KeysetHandle): HpkePrivateKey {
        val pkKs = CleartextKeysetHandle.getKeyset(keysetHandle)
        val pkKeyData = pkKs.keyList[0].keyData
        if (pkKeyData.typeUrl != "type.googleapis.com/google.crypto.tink.HpkePrivateKey") {
            throw Error("invalid key type")
        }

        return HpkePrivateKey.create(
            com.google.crypto.tink.hybrid.HpkePublicKey.create(
                hpkeParams,
                Bytes.copyFrom(DatatypeConverter.parseHexBinary(tekPublicKeyHex(keysetHandle))),
                null
            ),
            SecretBytes.copyFrom(
                com.google.crypto.tink.proto.HpkePrivateKey.parseFrom(pkKeyData.value).privateKey.toByteArray(),
                InsecureSecretKeyAccess.get()
            )
        )
    }

    private fun convertToUncompressedPublicKeyBytes(ephemeralPublicKey: ECPublicKey): ByteArray {
        val ecPoint = ephemeralPublicKey.w
        return EllipticCurves.pointEncode(
            EllipticCurves.CurveType.NIST_P256,
            EllipticCurves.PointFormatType.UNCOMPRESSED,
            ecPoint
        )
    }

    companion object {
        const val NAME = "NativeTEKStamper"
    }
}

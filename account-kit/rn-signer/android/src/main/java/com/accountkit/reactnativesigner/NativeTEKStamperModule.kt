package com.accountkit.reactnativesigner

import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.google.crypto.tink.config.TinkConfig
import com.google.crypto.tink.subtle.Base64
import com.google.crypto.tink.subtle.EllipticCurves
import java.nio.ByteBuffer
import java.security.KeyFactory
import java.security.Security
import java.security.Signature
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.bitcoinj.core.Base58
import org.bouncycastle.jce.ECNamedCurveTable
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.jce.spec.ECPublicKeySpec

@Serializable
data class ApiStamp(val publicKey: String, val scheme: String, val signature: String)

private const val BUNDLE_PRIVATE_KEY = "BUNDLE_PRIVATE_KEY"
private const val BUNDLE_PUBLIC_KEY = "BUNDLE_PUBLIC_KEY"

@ReactModule(name = NativeTEKStamperModule.NAME)
class NativeTEKStamperModule(reactContext: ReactApplicationContext) :
    NativeTEKStamperSpec(reactContext) {

    private val context = reactContext

    // This is how the docs for EncryptedSharedPreferences recommend creating this setup
    // NOTE: we can further customize the permissions around accessing this master key and the keys
    // used to generate it by using the .setKeyGenParameterSpec() method on this builder
    // this would allow us to further specify the access requirements to this key
    //
    // we should explore the best practices on how to do this once we reach a phase of further
    // cleanup
    private val masterKey =
        MasterKey.Builder(context.applicationContext)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            // requires that the phone be unlocked
            .setUserAuthenticationRequired(false)
            .build()

    /**
     * We are using EncryptedSharedPreferences to store 2 pieces of data
     * 1. the TEK keypair - this is the ephemeral key-pair that Turnkey will use to encrypt the
     * bundle with
     * 2. the decrypted private key for a session
     *
     * The reason we are not using the android key store for either of these things is because
     * 1. For us to be able to import the private key in the bundle into the KeyStore, Turnkey has
     * to return the key in a different format (AFAIK):
     * https://developer.android.com/privacy-and-security/keystore#ImportingEncryptedKeys
     * 2. If we store the TEK in the KeyStore, then we have to roll our own HPKE decrypt function as
     * there's no off the shelf solution (that I could find) to do the HPKE decryption. Rolling our
     * own decryption feels wrong given we are not experts on this and don't have a good way to
     * verify our implementation (and I don't trust the ChatGPT output to be correct. Even if it is,
     * there's no guarantee we can test all the edge cases since those are unknown unknowns)
     *
     * NOTE: this isn't too far off from how Turnkey recommends doing it in Swift
     * https://github.com/tkhq/swift-sdk/blob/5817374a7cbd4c99b7ea90b170363dc2bf6c59b9/docs/email-auth.md#email-authentication
     *
     * The open question is if the storage of the decrypted private key is secure enough though
     */
    private val sharedPreferences =
        EncryptedSharedPreferences.create(
            context,
            "tek_stamper_shared_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

    private val tekManager = HpkeTEKManager(sharedPreferences)

    init {
        TinkConfig.register()

        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME).javaClass !=
            BouncyCastleProvider::class.java
        ) {
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
            val tekPublicKey = tekManager.createTEK()

            return promise.resolve(tekPublicKey.toHex())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun clear() {
        sharedPreferences.edit().clear().apply()
    }

    override fun publicKey(): String? {
        return tekManager.publicKeyHex()
    }

    override fun injectCredentialBundle(bundle: String, promise: Promise) {
        try {
            val tekPublicKey =
                tekManager.publicKey()
                    ?: return promise.reject(Exception("Stamper has not been initialized"))

            val decodedBundle = Base58.decodeChecked(bundle)
            val buffer = ByteBuffer.wrap(decodedBundle)
            val ephemeralPublicKeyLength = 33
            val ephemeralPublicKeyBytes = ByteArray(ephemeralPublicKeyLength)
            buffer.get(ephemeralPublicKeyBytes)
            val ephemeralPublicKey =
                EllipticCurves.getEcPublicKey(
                    EllipticCurves.CurveType.NIST_P256,
                    EllipticCurves.PointFormatType.COMPRESSED,
                    ephemeralPublicKeyBytes,
                )
                    .toBytes(EllipticCurves.PointFormatType.UNCOMPRESSED)

            val ciphertext = ByteArray(buffer.remaining())
            buffer.get(ciphertext)

            val aad = ephemeralPublicKey + tekPublicKey.toByteArray()

            val decryptedKey =
                tekManager.hpkeDecrypt(
                    ephemeralPublicKey,
                    ciphertext,
                    "turnkey_hpke".toByteArray(),
                    aad
                )

            val (publicKeyBytes, privateKeyBytes) = privateKeyToKeyPair(decryptedKey)

            sharedPreferences
                .edit()
                .putString(BUNDLE_PRIVATE_KEY, privateKeyBytes.toHex().lowercase())
                .apply()

            sharedPreferences
                .edit()
                .putString(BUNDLE_PUBLIC_KEY, publicKeyBytes.toHex().lowercase())
                .apply()

            return promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun stamp(payload: String, promise: Promise) {
        try {
            val signingKeyHex =
                sharedPreferences.getString(BUNDLE_PRIVATE_KEY, null)
                    ?: return promise.reject(
                        Exception("No injected bundle, did you complete auth?")
                    )

            val publicSigningKeyHex =
                sharedPreferences.getString(BUNDLE_PUBLIC_KEY, null)
                    ?: return promise.reject(
                        Exception("No injected bundle, did you complete auth?")
                    )

            val ecPrivateKey =
                EllipticCurves.getEcPrivateKey(
                    EllipticCurves.CurveType.NIST_P256,
                    signingKeyHex.fromHex()
                )

            val signer = Signature.getInstance("SHA256withECDSA")
            signer.initSign(ecPrivateKey)
            signer.update(payload.toByteArray())
            val signature = signer.sign()

            val apiStamp =
                ApiStamp(publicSigningKeyHex, "SIGNATURE_SCHEME_TK_API_P256", signature.toHex())

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

    private fun privateKeyToKeyPair(privateKey: ByteArray): Pair<ByteArray, ByteArray> {
        val ecPrivateKey =
            EllipticCurves.getEcPrivateKey(EllipticCurves.CurveType.NIST_P256, privateKey)

        // compute the public key
        val s = ecPrivateKey.s
        val bcSpec = ECNamedCurveTable.getParameterSpec("secp256r1")
        val pubSpec = ECPublicKeySpec(bcSpec.g.multiply(s).normalize(), bcSpec)
        val keyFactory = KeyFactory.getInstance("EC", BouncyCastleProvider.PROVIDER_NAME)

        val ecPublicKey = EllipticCurves.getEcPublicKey(keyFactory.generatePublic(pubSpec).encoded)

        // verify the key pair
        EllipticCurves.validatePublicKey(ecPublicKey, ecPrivateKey)

        // compress it to match turnkey expectations
        val compressedPublicKey =
            ecPublicKey.toBytes(
                EllipticCurves.PointFormatType.COMPRESSED,
            )
        return Pair(compressedPublicKey, privateKey)
    }

    companion object {
        const val NAME = "NativeTEKStamper"
    }
}

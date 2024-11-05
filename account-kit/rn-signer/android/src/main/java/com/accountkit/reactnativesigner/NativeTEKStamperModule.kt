package com.accountkit.reactnativesigner

import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.google.crypto.tink.BinaryKeysetReader
import com.google.crypto.tink.BinaryKeysetWriter
import com.google.crypto.tink.HybridDecrypt
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.TinkJsonProtoKeysetFormat
import com.google.crypto.tink.config.TinkConfig
import com.google.crypto.tink.hybrid.HpkeParameters
import com.google.crypto.tink.subtle.EllipticCurves
import org.bitcoinj.core.Base58
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import javax.xml.bind.DatatypeConverter

@ReactModule(name = NativeTEKStamperModule.NAME)
class NativeTEKStamperModule(reactContext: ReactApplicationContext) :
    NativeTEKStamperSpec(reactContext) {

    private val TEK_STORAGE_KEY = "TEK_STORAGE_KEY"
    private val BUNDLE_KEY = "BUNDLE_KEY"
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
     * has to return the key in a different format: https://developer.android.com/privacy-and-security/keystore#ImportingEncryptedKeys
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

    init {
        TinkConfig.register()
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
            // This allows us to do the HPKE decryption of the bundle
            val hpkeParams = HpkeParameters.builder()
                .setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
                .setKdfId(HpkeParameters.KdfId.HKDF_SHA256)
                .setAeadId(HpkeParameters.AeadId.AES_256_GCM)
                .setVariant(HpkeParameters.Variant.NO_PREFIX)
                .build()

            // Generate a P256 key
            val keyHandle = KeysetHandle.generateNew(hpkeParams)

            // Store the ephemeral key in encrypted shared preferences
            sharedPreferences
                .edit()
                .putString(
                    TEK_STORAGE_KEY,
                    TinkJsonProtoKeysetFormat.serializeKeysetWithoutSecret(keyHandle)
                )
                .apply()
            return promise.resolve(publicKeyToHex(keyHandle))
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun publicKey(): String? {
        val existingHandle = getRecipientKeyHandle() ?: return null

        return publicKeyToHex(existingHandle)
    }

    override fun injectCredentialBundle(bundle: String, promise: Promise) {
        try {
            val tekHandle = getRecipientKeyHandle()
                ?: return promise.reject(Exception("Stamper has not been initialized"))

            val decodedBundle = Base58.decodeChecked(bundle)
            val buffer = ByteBuffer.wrap(decodedBundle)

            // Turnkey bundle is first 33 bytes as the key and remaining the encrypted private key
            val ephemeralPublicKeyLength = 33
            val ephemeralPublicKeyBytes = ByteArray(ephemeralPublicKeyLength)
            buffer.get(ephemeralPublicKeyBytes)
            val ciphertext = ByteArray(buffer.remaining())
            buffer.get(ciphertext)

            val hybridDecrypt = tekHandle.getPrimitive(HybridDecrypt::class.java)
            val context = ephemeralPublicKeyBytes + publicKeyToHex(tekHandle).toByteArray()
            val decryptedKey =
                hybridDecrypt.decrypt(ciphertext, context)

            sharedPreferences.edit()
                .putString(BUNDLE_KEY, DatatypeConverter.printHexBinary(decryptedKey).uppercase())
                .apply()

            return promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun stamp(payload: String?, promise: Promise) {
        TODO("Not yet implemented")
    }

    private fun getRecipientKeyHandle(): KeysetHandle? {
        if (!sharedPreferences.contains(TEK_STORAGE_KEY)) {
            return null;
        }

        return TinkJsonProtoKeysetFormat.parseKeysetWithoutSecret(
            sharedPreferences.getString(
                TEK_STORAGE_KEY,
                "{}"
            )
        )
    }

    private fun publicKeyToHex(keyHandle: KeysetHandle): String {
        val outputStream = ByteArrayOutputStream()
        keyHandle.publicKeysetHandle.writeNoSecret(
            BinaryKeysetWriter.withOutputStream(
                outputStream
            )
        )
        return DatatypeConverter.printHexBinary(outputStream.toByteArray()).uppercase()
    }

    companion object {
        const val NAME = "NativeTEKStamper"
    }
}

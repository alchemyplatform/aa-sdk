package com.accountkit.reactnativesigner

import android.content.SharedPreferences
import com.google.crypto.tink.InsecureSecretKeyAccess
import com.google.crypto.tink.KeyTemplate
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.TinkJsonProtoKeysetFormat
import com.google.crypto.tink.hybrid.HpkeParameters
import com.google.crypto.tink.hybrid.HpkePublicKey
import com.google.crypto.tink.hybrid.internal.HpkeContext
import com.google.crypto.tink.hybrid.internal.HpkeKemKeyFactory
import com.google.crypto.tink.hybrid.internal.HpkePrimitiveFactory

private const val TEK_STORAGE_KEY = "TEK_STORAGE_KEY"
private val hpkeParams = HpkeParameters.builder()
    .setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
    .setKdfId(HpkeParameters.KdfId.HKDF_SHA256)
    .setAeadId(HpkeParameters.AeadId.AES_256_GCM)
    .setVariant(HpkeParameters.Variant.NO_PREFIX)
    .build()

class HpkeTEKManager(private val sharedPreferences: SharedPreferences) {
    fun hpkeDecrypt(
        encapsulatePublicKey: ByteArray,
        cipherText: ByteArray,
        info: ByteArray,
        aad: ByteArray
    ): ByteArray {
        // Why do we hve to do all this rather than doing:
        // val hybridDecrypt = tekHandle.getPrimitive(HybridDecrypt::class.java)
        // val decryptedKey = hybridDecrypt.decrypt(ciphertext, "turnkey_hpke".toByteArray())
        // the hybridDecrypt.decrypt that google exposes doesn't allow us to pass in
        // the aad that's needed to complete decryption
        val keyHandle = getKeysetHandle() ?: throw IllegalStateException("No TEK found!")

        val recipient = HpkeContext.createRecipientContext(
            encapsulatePublicKey,
            HpkeKemKeyFactory.createPrivate(keyHandle.toHpkePrivateKey(hpkeParams)),
            HpkePrimitiveFactory.createKem(hpkeParams.kemId),
            HpkePrimitiveFactory.createKdf(hpkeParams.kdfId),
            HpkePrimitiveFactory.createAead(hpkeParams.aeadId),
            info
        )

        return recipient.open(cipherText, aad)
    }

    fun createTEK(): HpkePublicKey {
        val existingPublicKey = publicKey()
        if (existingPublicKey != null) {
            return existingPublicKey
        }

        val keysetHandle = KeysetHandle.generateNew(KeyTemplate.createFrom(hpkeParams))

        sharedPreferences
            .edit()
            .putString(
                TEK_STORAGE_KEY,
                TinkJsonProtoKeysetFormat.serializeKeyset(
                    keysetHandle,
                    InsecureSecretKeyAccess.get()
                )
            )
            .apply()

        return keysetHandle.toHpkePublicKey(hpkeParams)
    }

    fun publicKey(): HpkePublicKey? {
        val ksHandle = getKeysetHandle() ?: return null

        return ksHandle.toHpkePublicKey(hpkeParams)
    }

    fun publicKeyHex(): String? {
        return publicKey()?.toHex()
    }

    private fun getKeysetHandle(): KeysetHandle? {
        val storageVal = sharedPreferences.getString(TEK_STORAGE_KEY, null) ?: return null

        return TinkJsonProtoKeysetFormat.parseKeyset(
            storageVal,
            InsecureSecretKeyAccess.get()
        )
    }
}
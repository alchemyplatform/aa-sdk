package com.accountkit.reactnativesigner

import com.google.crypto.tink.CleartextKeysetHandle
import com.google.crypto.tink.InsecureSecretKeyAccess
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.hybrid.HpkeParameters
import com.google.crypto.tink.hybrid.HpkePrivateKey
import com.google.crypto.tink.hybrid.HpkePublicKey
import com.google.crypto.tink.subtle.EllipticCurves
import com.google.crypto.tink.util.Bytes
import com.google.crypto.tink.util.SecretBytes
import java.security.interfaces.ECPublicKey
import javax.xml.bind.DatatypeConverter
import com.google.crypto.tink.proto.HpkePrivateKey as ProtoHpkePrivateKey
import com.google.crypto.tink.proto.HpkePublicKey as ProtoHpkePublicKey

// Keyset Handle Extensions
fun KeysetHandle.toHpkePublicKey(hpkeParameters: HpkeParameters): HpkePublicKey {
    val keySet = CleartextKeysetHandle.getKeyset(this.publicKeysetHandle)
    val protoKey = ProtoHpkePublicKey.parseFrom(keySet.keyList[0].keyData.value)

    return HpkePublicKey.create(
        hpkeParameters,
        Bytes.copyFrom(protoKey.publicKey.toByteArray()),
        null
    )
}

fun KeysetHandle.toHpkePrivateKey(hpkeParams: HpkeParameters): HpkePrivateKey {
    val publicKey = this.toHpkePublicKey(hpkeParams)
    val pkKs = CleartextKeysetHandle.getKeyset(this)
    val pkKeyData = pkKs.keyList[0].keyData
    check(pkKeyData.typeUrl == "type.googleapis.com/google.crypto.tink.HpkePrivateKey") {
        "invalid key type"
    }

    return HpkePrivateKey.create(
        HpkePublicKey.create(
            hpkeParams,
            Bytes.copyFrom(publicKey.toByteArray()),
            null
        ),
        SecretBytes.copyFrom(
            ProtoHpkePrivateKey.parseFrom(pkKeyData.value).privateKey.toByteArray(),
            InsecureSecretKeyAccess.get()
        )
    )
}

// HPKE Public Key Extensions
fun HpkePublicKey.toHex(): String {
    return this.toByteArray().toHex()
}

fun HpkePublicKey.toByteArray(): ByteArray {
    return this.publicKeyBytes.toByteArray()
}

// ECPublicKey Extensions
fun ECPublicKey.toBytes(
    pfType: EllipticCurves.PointFormatType
): ByteArray {
    return EllipticCurves.pointEncode(
        this.params.curve,
        pfType,
        this.w
    )
}

// Conversions from Hex <-> byte[]
fun String.fromHex(): ByteArray {
    return DatatypeConverter.parseHexBinary(this)
}

fun ByteArray.toHex(): String {
    return DatatypeConverter.printHexBinary(this)
}
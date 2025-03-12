package com.alchemy.aa.core;

import com.alchemy.aa.core.exceptions.NoTEKException;
import com.google.crypto.tink.CleartextKeysetHandle;
import com.google.crypto.tink.InsecureSecretKeyAccess;
import com.google.crypto.tink.KeyTemplate;
import com.google.crypto.tink.KeysetHandle;
import com.google.crypto.tink.TinkJsonProtoKeysetFormat;
import com.google.crypto.tink.hybrid.HpkeParameters;
import com.google.crypto.tink.hybrid.HpkePrivateKey;
import com.google.crypto.tink.hybrid.HpkePublicKey;
import com.google.crypto.tink.hybrid.internal.HpkeContext;
import com.google.crypto.tink.hybrid.internal.HpkeKemKeyFactory;
import com.google.crypto.tink.hybrid.internal.HpkePrimitiveFactory;
import com.google.crypto.tink.proto.KeyData;
import com.google.crypto.tink.proto.Keyset;
import com.google.crypto.tink.util.Bytes;
import com.google.crypto.tink.util.SecretBytes;
import com.google.protobuf.InvalidProtocolBufferException;
import java.security.GeneralSecurityException;

public class TEKManager {

    public static TEKManager InitializeTEKManagerFromHpkeKey(HpkePrivateKey privateKey)
            throws GeneralSecurityException {
        KeysetHandle keysetHandle = KeysetHandle.newBuilder()
                .addEntry(KeysetHandle.importKey(privateKey).makePrimary().withFixedId(0)).build();
        return InitializeTEKManagerFromKeySetHandle(keysetHandle);
    }

    public static TEKManager InitializeTEKManagerFromKeySetHandle(KeysetHandle keysetHandle)
            throws GeneralSecurityException {
        TEKManager tek = new TEKManager();

        String serializedKeyset = TinkJsonProtoKeysetFormat.serializeKeyset(keysetHandle,
                InsecureSecretKeyAccess.get());
        tek.serializedKeyset = serializedKeyset.toCharArray();
        return tek;
    }

    public static TEKManager InitializeTekManager() throws GeneralSecurityException, InvalidProtocolBufferException {
        TEKManager tek = new TEKManager();
        tek.createTEK();
        return tek;
    }

    public HpkePublicKey createTEK() throws GeneralSecurityException, InvalidProtocolBufferException {

        HpkePublicKey existingPublicKey = getPublicKey();
        if (existingPublicKey != null) {
            return existingPublicKey;
        }

        KeysetHandle keysetHandle = KeysetHandle.generateNew(KeyTemplate.createFrom(getHpkeParams()));
        String serializedKeyset = TinkJsonProtoKeysetFormat.serializeKeyset(keysetHandle,
                InsecureSecretKeyAccess.get());

        this.serializedKeyset = serializedKeyset.toCharArray();
        return this.toHpkePublicKey(getHpkeParams(), keysetHandle);
    }

    private KeysetHandle getKeysetHandle() {
        if (this.serializedKeyset == null) {
            return null;
        }
        try {
            return TinkJsonProtoKeysetFormat.parseKeyset(String.valueOf(this.serializedKeyset),
                    InsecureSecretKeyAccess.get());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Get hpke public key from stored keyset handle.
     *
     * @return hpke public key or null if createTEK is never called.
     */
    public HpkePublicKey getPublicKey() throws GeneralSecurityException, InvalidProtocolBufferException {
        KeysetHandle ksHandler = this.getKeysetHandle();
        if (ksHandler == null) {
            return null;
        }
        return toHpkePublicKey(getHpkeParams(), ksHandler);
    }

    /**
     * Decrypt use hpke public keys
     *
     * @param encapsulatePublicKey
     *            public key
     * @param cipherText
     *            encrypted data
     * @param info
     *            HPKE context
     * @param aad
     *            HPKE
     *
     * @return decipher text.
     *
     * @throws NoTEKException
     */
    public byte[] hpkeDecrypt(byte[] encapsulatePublicKey, byte[] cipherText, byte[] info, byte[] aad)
            throws NoTEKException, GeneralSecurityException, InvalidProtocolBufferException {

        KeysetHandle keyHandle = getKeysetHandle();
        if (keyHandle == null) {
            throw new NoTEKException();
        }

        HpkeParameters hpkeParams = getHpkeParams();

        HpkeContext recipient = HpkeContext.createRecipientContext(encapsulatePublicKey,
                HpkeKemKeyFactory.createPrivate(this.toHpkePrivateKey(hpkeParams, keyHandle)),
                HpkePrimitiveFactory.createKem(hpkeParams.getKemId()),
                HpkePrimitiveFactory.createKdf(hpkeParams.getKdfId()),
                HpkePrimitiveFactory.createAead(hpkeParams.getAeadId()), info);
        return recipient.open(cipherText, aad);
    }

    private char[] serializedKeyset;

    private static HpkeParameters _hpkeParams;

    private static HpkeParameters getHpkeParams() throws GeneralSecurityException {
        if (TEKManager._hpkeParams == null) {
            TEKManager._hpkeParams = HpkeParameters.builder().setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
                    .setKdfId(HpkeParameters.KdfId.HKDF_SHA256).setAeadId(HpkeParameters.AeadId.AES_256_GCM)
                    .setVariant(HpkeParameters.Variant.NO_PREFIX).build();
        }
        return TEKManager._hpkeParams;
    }

    private HpkePublicKey toHpkePublicKey(HpkeParameters hpkeParams, KeysetHandle keysetHandle)
            throws GeneralSecurityException, InvalidProtocolBufferException {
        Keyset keySet = CleartextKeysetHandle.getKeyset(keysetHandle.getPublicKeysetHandle());
        com.google.crypto.tink.proto.HpkePublicKey protoKey = com.google.crypto.tink.proto.HpkePublicKey
                .parseFrom(keySet.getKeyList().get(0).getKeyData().getValue());
        return HpkePublicKey.create(hpkeParams, Bytes.copyFrom(protoKey.getPublicKey().toByteArray()),
                /* idRequirement= */null);

    }

    private HpkePrivateKey toHpkePrivateKey(HpkeParameters hpkeParams, KeysetHandle keysetHandle)
            throws GeneralSecurityException, InvalidProtocolBufferException {
        HpkePublicKey publicKey = this.toHpkePublicKey(hpkeParams, keysetHandle);
        Keyset pkKs = CleartextKeysetHandle.getKeyset(keysetHandle);
        KeyData pkKeyData = pkKs.getKeyList().get(0).getKeyData();
        assert (pkKeyData.getTypeUrl().equals("type.googleapis.com/google.crypto.tink.HpkePrivateKey"))
                : "invalid key type";
        return HpkePrivateKey.create(
                HpkePublicKey.create(hpkeParams, Bytes.copyFrom(publicKey.getPublicKeyBytes().toByteArray()), null),
                SecretBytes.copyFrom(com.google.crypto.tink.proto.HpkePrivateKey.parseFrom(pkKeyData.getValue())
                        .getPrivateKey().toByteArray(), InsecureSecretKeyAccess.get()));

    }

    private TEKManager() {
    }

}

package com.alchemy.aa.core;

import com.alchemy.aa.core.exceptions.InvalidKeyTypeException;
import com.alchemy.aa.core.exceptions.NoTekException;
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

public class TekManager {

  public static TekManager fromHpkeKey(HpkePrivateKey privateKey)
    throws GeneralSecurityException {
    KeysetHandle keysetHandle = KeysetHandle.newBuilder()
      .addEntry(KeysetHandle.importKey(privateKey).makePrimary().withFixedId(0))
      .build();
    return fromKeysetHandle(keysetHandle);
  }

  public static TekManager fromKeysetHandle(KeysetHandle keysetHandle)
    throws GeneralSecurityException {
    TekManager tek = new TekManager();

    String serializedKeyset = TinkJsonProtoKeysetFormat.serializeKeyset(
      keysetHandle,
      InsecureSecretKeyAccess.get()
    );
    tek.serializedKeyset = serializedKeyset.toCharArray();
    return tek;
  }

  public static TekManager createNew() throws GeneralSecurityException {
    TekManager tek = new TekManager();
    KeysetHandle keysetHandle = KeysetHandle.generateNew(
      KeyTemplate.createFrom(getHpkeParams())
    );
    String serializedKeyset = TinkJsonProtoKeysetFormat.serializeKeyset(
      keysetHandle,
      InsecureSecretKeyAccess.get()
    );

    tek.serializedKeyset = serializedKeyset.toCharArray();
    return tek;
  }

  public KeysetHandle getKeysetHandle() {
    try {
      return TinkJsonProtoKeysetFormat.parseKeyset(
        String.valueOf(this.serializedKeyset),
        InsecureSecretKeyAccess.get()
      );
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Get hpke public key from stored keyset handle.
   *
   * @return hpke public key.
   */
  public HpkePublicKey getPublicKey()
    throws GeneralSecurityException, InvalidProtocolBufferException {
    KeysetHandle ksHandler = this.getKeysetHandle();
    if (ksHandler == null) {
      return null;
    }
    return toHpkePublicKey(getHpkeParams(), ksHandler);
  }

  public String publicKey()
    throws GeneralSecurityException, InvalidProtocolBufferException {
    KeysetHandle ksHandler = this.getKeysetHandle();
    if (ksHandler == null) {
      return null;
    }
    return org.bouncycastle.util.encoders.Hex.toHexString(
      getPublicKey().getPublicKeyBytes().toByteArray()
    );
  }

  public HpkePrivateKey privateKey()
    throws GeneralSecurityException, InvalidProtocolBufferException {
    KeysetHandle ksHandler = this.getKeysetHandle();
    if (ksHandler == null) {
      return null;
    }
    return toHpkePrivaTekey(getHpkeParams(), ksHandler);
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
   * @throws NoTekException
   */
  public byte[] hpkeDecrypt(
    byte[] encapsulatePublicKey,
    byte[] cipherText,
    byte[] info,
    byte[] aad
  )
    throws NoTekException, GeneralSecurityException, InvalidProtocolBufferException {
    KeysetHandle keyHandle = getKeysetHandle();
    if (keyHandle == null) {
      throw new NoTekException();
    }

    HpkeParameters hpkeParams = getHpkeParams();

    HpkeContext recipient = HpkeContext.createRecipientContext(
      encapsulatePublicKey,
      HpkeKemKeyFactory.createPrivate(
        this.toHpkePrivaTekey(hpkeParams, keyHandle)
      ),
      HpkePrimitiveFactory.createKem(hpkeParams.getKemId()),
      HpkePrimitiveFactory.createKdf(hpkeParams.getKdfId()),
      HpkePrimitiveFactory.createAead(hpkeParams.getAeadId()),
      info
    );
    return recipient.open(cipherText, aad);
  }

  private char[] serializedKeyset;

  private static HpkeParameters _hpkeParams;

  private static synchronized HpkeParameters getHpkeParams()
    throws GeneralSecurityException {
    if (TekManager._hpkeParams == null) {
      TekManager._hpkeParams = HpkeParameters.builder()
        .setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
        .setKdfId(HpkeParameters.KdfId.HKDF_SHA256)
        .setAeadId(HpkeParameters.AeadId.AES_256_GCM)
        .setVariant(HpkeParameters.Variant.NO_PREFIX)
        .build();
    }
    return TekManager._hpkeParams;
  }

  private HpkePublicKey toHpkePublicKey(
    HpkeParameters hpkeParams,
    KeysetHandle keysetHandle
  ) throws GeneralSecurityException, InvalidProtocolBufferException {
    Keyset keySet = CleartextKeysetHandle.getKeyset(
      keysetHandle.getPublicKeysetHandle()
    );
    com.google.crypto.tink.proto.HpkePublicKey protoKey =
      com.google.crypto.tink.proto.HpkePublicKey.parseFrom(
        keySet.getKeyList().get(0).getKeyData().getValue()
      );
    return HpkePublicKey.create(
      hpkeParams,
      Bytes.copyFrom(protoKey.getPublicKey().toByteArray()),
      /* idRequirement= */null
    );
  }

  private HpkePrivateKey toHpkePrivaTekey(
    HpkeParameters hpkeParams,
    KeysetHandle keysetHandle
  ) throws GeneralSecurityException, InvalidProtocolBufferException {
    HpkePublicKey publicKey = this.toHpkePublicKey(hpkeParams, keysetHandle);
    Keyset pkKs = CleartextKeysetHandle.getKeyset(keysetHandle);
    KeyData pkKeyData = pkKs.getKeyList().get(0).getKeyData();
    if (
      !pkKeyData
        .getTypeUrl()
        .equals("type.googleapis.com/google.crypto.tink.HpkePrivateKey")
    ) {
      throw new InvalidKeyTypeException("Invalid key type");
    }
    return HpkePrivateKey.create(
      HpkePublicKey.create(
        hpkeParams,
        Bytes.copyFrom(publicKey.getPublicKeyBytes().toByteArray()),
        null
      ),
      SecretBytes.copyFrom(
        com.google.crypto.tink.proto.HpkePrivateKey.parseFrom(
          pkKeyData.getValue()
        )
          .getPrivateKey()
          .toByteArray(),
        InsecureSecretKeyAccess.get()
      )
    );
  }

  private TekManager() {}
}

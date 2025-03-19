import com.alchemy.aa.core.CredentialBundle;
import com.alchemy.aa.core.Stamper;
import com.alchemy.aa.core.TekManager;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.crypto.tink.InsecureSecretKeyAccess;
import com.google.crypto.tink.config.TinkConfig;
import com.google.crypto.tink.hybrid.HpkeParameters;
import com.google.crypto.tink.hybrid.HpkePrivateKey;
import com.google.crypto.tink.hybrid.HpkePublicKey;
import com.google.crypto.tink.util.Bytes;
import com.google.crypto.tink.util.SecretBytes;
import com.google.protobuf.InvalidProtocolBufferException;
import java.security.GeneralSecurityException;
import org.bouncycastle.util.encoders.Hex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class StamperTests {

  TekManager tekManager;

  public StamperTests() throws GeneralSecurityException {
    TinkConfig.register();
  }

  @BeforeEach
  public void setUp()
    throws GeneralSecurityException, InvalidProtocolBufferException {
    SecretBytes private_key = SecretBytes.copyFrom(
      Hex.decode(
        "32528601f4d9a10994b781bd2c1616d96d95b4b2e17116d7fc7003e8a86fc779"
      ),
      InsecureSecretKeyAccess.get()
    );
    Bytes public_key = Bytes.copyFrom(
      Hex.decode(
        "045e0e1f9e7761f87c02d947ab77363b38db79188962ddad15617d7b6e01b0e8f51bee4ca2e4c9ad26dbf9cec5008a83ca84ec7aabb820ada733ed46b4e221a76d"
      )
    );

    HpkeParameters parameters = HpkeParameters.builder()
      .setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
      .setKdfId(HpkeParameters.KdfId.HKDF_SHA256)
      .setAeadId(HpkeParameters.AeadId.AES_256_GCM)
      .setVariant(HpkeParameters.Variant.NO_PREFIX)
      .build();
    HpkePublicKey hpkePublicKey = HpkePublicKey.create(
      parameters,
      public_key,
      /* idRequirement= */null
    );
    HpkePrivateKey hpkePrivateKey = HpkePrivateKey.create(
      hpkePublicKey,
      private_key
    );
    tekManager = TekManager.fromHpkeKey(hpkePrivateKey);
  }

  @Test
  public void injectCredentialBundle()
    throws GeneralSecurityException, InvalidProtocolBufferException, JsonProcessingException {
    String credentialBundle =
      "2AdeMPFUCZm3ywdNGyVzdTTd7Q15FjzhjkFCQD3rUfxJsaAq5rwcfWPHpLNXSsuPEXc4pUd8jyJ4QY9XAo2JBaLERLgDL2vwHh2psF94vYacf4W1iKre";
    CredentialBundle cb = CredentialBundle.fromEncryptedBundle(
      credentialBundle,
      tekManager
    );
    Stamper stamper = new Stamper(cb);

    Stamper.Stamp stamp = stamper.stamp(
      "{\n" +
      "  \"organizationId\" : \"e34032d8-d42f-4980-9f07-b7b40f765789\"\n" +
      "}"
    );

    System.out.println(stamp);
  }
}

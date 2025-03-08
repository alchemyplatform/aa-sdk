import com.alchemy.aa.Stamper;
import com.alchemy.aa.core.TEKManager;
import com.google.crypto.tink.InsecureSecretKeyAccess;
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
    TEKManager tekManager;

    public StamperTests() throws GeneralSecurityException {
    }

    @BeforeEach
    public void setUp() throws GeneralSecurityException, InvalidProtocolBufferException {
        SecretBytes private_key = SecretBytes.copyFrom(
                Hex.decode("dbb5689c93418eb95a0f54a9d56b4af289a00c80a0650c2463c8f9c0803cf52c"),
                InsecureSecretKeyAccess.get());
        Bytes public_key = Bytes.copyFrom(Hex.decode(
                "04d22099b7499f03055f540def34f76798bd28df87c111f3503715788f70ea57066b3b45d40ff0801e930d15959c0ba2ec22903685e9005e8add6d1f94c5d68bcb"));
        HpkeParameters parameters = HpkeParameters.builder().setKemId(HpkeParameters.KemId.DHKEM_P256_HKDF_SHA256)
                .setKdfId(HpkeParameters.KdfId.HKDF_SHA256).setAeadId(HpkeParameters.AeadId.AES_256_GCM)
                .setVariant(HpkeParameters.Variant.NO_PREFIX).build();
        HpkePublicKey hpkePublicKey = HpkePublicKey.create(parameters, public_key, /* idRequirement= */null);
        HpkePrivateKey hpkePrivateKey = HpkePrivateKey.create(hpkePublicKey, private_key);
        tekManager = TEKManager.InitializeTEKManagerFromHpkeKey(hpkePrivateKey);
    }

    @Test
    public void injectCredentialBundle() throws GeneralSecurityException, InvalidProtocolBufferException {
        Stamper stamper = new Stamper(tekManager);
        String credentialBundle = "26CDY37MNf4BCXFaTyAhbCndbRKivLjdR69oRf7engwqSnh7bh7TZzg1h8opiHeMEaeHDQJBYk6o3KfS463VAiFCg6s4WamkpTnbKFbp2mbu4sJWcxPF";
        stamper.injectCredentialBundle(credentialBundle);
        Stamper.Stamp stamp = stamper.stamp("bala");
        System.out.println(stamp);
    }

    @Test
    public void loadExistingKeyTest() throws InvalidProtocolBufferException, GeneralSecurityException {
        String result = Hex.toHexString((tekManager.getPublicKey().getPublicKeyBytes().toByteArray()));
        System.out.println(result);
    }
}

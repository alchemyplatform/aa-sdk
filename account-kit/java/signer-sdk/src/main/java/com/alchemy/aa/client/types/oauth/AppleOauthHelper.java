package com.alchemy.aa.client.types.oauth;

import alchemy.signerservice.oauth.types.AppleConfig;
import alchemy.signerservice.oauth.types.AuthProviderConfig;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.ECPrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

public class AppleOauthHelper {

  // Apple defines a max allowable expiration time for a client secret of 6 months
  private static final long MAX_EXPIRATION_SECONDS = TimeUnit.DAYS.toSeconds(
    182
  );

  public static AuthProviderConfig getAuthProviderConfig(AppleConfig config) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(MAX_EXPIRATION_SECONDS);

    Algorithm algorithm = Algorithm.ECDSA256(
      null,
      loadPrivateKey(config.privateKey())
    );

    // From https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret
    String clientSecret = JWT
      .create()
      .withKeyId(config.keyId())
      .withIssuer(config.teamId())
      .withIssuedAt(Date.from(now))
      .withExpiresAt(Date.from(exp))
      .withAudience("https://appleid.apple.com")
      .withSubject(config.clientId())
      .sign(algorithm);

    return AuthProviderConfig
      .builder()
      .id("apple")
      .issuer("https://appleid.apple.com")
      .authEndpoint("https://appleid.apple.com/auth/authorize")
      .tokenEndpoint("https://appleid.apple.com/auth/token")
      .jwksUri("https://appleid.apple.com/auth/keys")
      .clientId(config.clientId())
      .clientSecret(clientSecret)
      .build();
  }

  private static ECPrivateKey loadPrivateKey(String keyString) {
    byte[] keyBytes = Base64.getDecoder().decode(keyString);

    PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
    try {
      KeyFactory kf = KeyFactory.getInstance("EC");
      return (ECPrivateKey) kf.generatePrivate(spec);
    } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
      throw new RuntimeException("Failed to load private key", e);
    }
  }
}

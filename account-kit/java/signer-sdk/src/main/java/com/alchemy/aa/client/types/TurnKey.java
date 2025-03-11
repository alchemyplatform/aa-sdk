package com.alchemy.aa.client.types;

import java.util.List;
import lombok.Builder;

public class TurnKey {
  public record TurnKeyStampedRequest(TurnKeyStamp stamp, String body) {}

  public record TurnKeyStamp(String stampHeaderName, String stampHeaderValue) {}


  @Builder
  public record OauthProviderParams(
      String providerName,
      String jwksUri,
      String oidcToken
  ) {}

  @Builder
  public record Attestation(
      String credentialId,
      String clientDataJson,
      String attestationObject,
      List<AuthenticatorTransport> transports
  ) {}

  public enum AuthenticatorTransport {
    AUTHENTICATOR_TRANSPORT_BLE,
    AUTHENTICATOR_TRANSPORT_INTERNAL,
    AUTHENTICATOR_TRANSPORT_NFC,
    AUTHENTICATOR_TRANSPORT_USB,
    AUTHENTICATOR_TRANSPORT_HYBRID,
  }

}

package com.alchemy.aa.client.types.oauth.types;

import java.util.Optional;
import lombok.Builder;

@Builder
public record NewAuthProviderConfig(
  String id,
  Optional<String> issuer,
  Optional<String> authEndpoint,
  Optional<String> tokenEndpoint,
  Optional<String> jwksUri,
  Optional<String> clientId,
  Optional<String> clientSecret
) {}

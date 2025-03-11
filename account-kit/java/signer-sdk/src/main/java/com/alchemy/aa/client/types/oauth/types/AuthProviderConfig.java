package com.alchemy.aa.client.types.oauth.types;

import lombok.Builder;

@Builder
public record AuthProviderConfig(
  String id,
  String issuer,
  String authEndpoint,
  String tokenEndpoint,
  String jwksUri,
  String clientId,
  String clientSecret
) {}

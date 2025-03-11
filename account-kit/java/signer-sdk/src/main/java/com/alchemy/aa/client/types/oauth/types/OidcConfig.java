package com.alchemy.aa.client.types.oauth.types;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;

/**
 * Representation of the configuration we need, returned from an
 * `{issuer}/.well-known/openid-configuration` endpoint.
 */
@Builder
@JsonNaming(SnakeCaseStrategy.class)
public record OidcConfig(
  String authorizationEndpoint,
  String jwksUri,
  String tokenEndpoint
) {}

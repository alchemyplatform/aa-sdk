package com.alchemy.aa.client.types.oauth.types;

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;

/**
 * Body of the request sent to the token endpoint in the OIDC flow.
 */
@Builder
@JsonNaming(SnakeCaseStrategy.class)
public record FetchIdTokenRequest(
  String code,
  String codeVerifier,
  String clientId,
  String clientSecret,
  String redirectUri,
  String grantType
) {}

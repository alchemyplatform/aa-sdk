package com.alchemy.aa.client.types.oauth.types;

import lombok.Builder;

@Builder
public record InternalAuthProviderConfig(
  FrontendAuthProviderConfig publicConfig,
  String issuer,
  String clientSecret
) {}

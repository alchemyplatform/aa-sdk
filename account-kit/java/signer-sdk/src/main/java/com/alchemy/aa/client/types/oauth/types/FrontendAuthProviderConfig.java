package com.alchemy.aa.client.types.oauth.types;

import java.util.Optional;
import lombok.Builder;

@Builder
public record FrontendAuthProviderConfig(
  String id,
  String clientId,
  String authEndpoint,
  Optional<Boolean> isCustomProvider
) {}

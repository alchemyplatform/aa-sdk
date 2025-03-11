package com.alchemy.aa.client.types.oauth.types;

import java.util.List;
import java.util.Optional;
import lombok.Builder;

@Builder
public record OauthAppConfig(
  List<String> defaultProviderIds,
  List<AuthProviderConfig> customProviderConfigs,
  Optional<AppleConfig> appleConfig,
  List<String> allowedOrigins
) {}

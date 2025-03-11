package com.alchemy.aa.client.types.oauth.types;

import lombok.Builder;

@Builder
public record AppleConfig(
  String clientId,
  String teamId,
  String keyId,
  String privateKey
) {}

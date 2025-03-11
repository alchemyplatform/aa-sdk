package com.alchemy.aa.client.types.oauth.types;

import java.util.Optional;

public record OauthState(
  String authProviderId,
  Optional<Boolean> isCustomProvider,
  String requestKey,
  String turnkeyPublicKey,
  Optional<Long> expirationSeconds,
  Optional<String> redirectUrl,
  Optional<String> openerOrigin
) {}

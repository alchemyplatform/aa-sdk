package com.alchemy.aa.records;

import alchemy.signerservice.oauth.types.OauthAppConfig;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public record UpdatedProjectConfig(
  UUID uuid,
  String name,
  List<String> appIds,
  boolean enableEmail,
  String emailProjectName,
  Optional<String> primaryColor,
  Optional<String> accentColor,
  String redirectUrl,
  Optional<String> supportUrl,
  Optional<OauthAppConfig> oauthConfig
) {}

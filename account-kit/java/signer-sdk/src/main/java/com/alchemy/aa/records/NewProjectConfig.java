package com.alchemy.aa.records;

import alchemy.signerservice.oauth.types.OauthAppConfig;
import java.util.List;
import java.util.Optional;

public record NewProjectConfig(
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

package com.alchemy.aa.records;

import alchemy.signerservice.oauth.types.OauthAppConfig;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.jooq.types.ULong;

public record ProjectConfig(
  UUID uuid,
  ULong teamId,
  String name,
  Optional<String> logoImageUrl,
  boolean enableEmail,
  String emailProjectName,
  String primaryColor,
  String accentColor,
  String redirectUrl,
  Optional<String> supportUrl,
  List<String> appIds,
  Optional<SignatureStats> signatureStats,
  OauthAppConfig oauthConfig
) {}

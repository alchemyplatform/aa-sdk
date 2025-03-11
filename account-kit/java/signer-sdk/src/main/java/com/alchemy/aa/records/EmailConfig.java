package com.alchemy.aa.records;

import java.util.Optional;

public record EmailConfig(
  String emailProjectName,
  Optional<String> primaryColor,
  Optional<String> accentColor,
  String redirectUrl,
  Optional<String> supportUrl
) {}

package com.alchemy.aa.records;

import java.util.Optional;

public record TeamSignatureStats(
  Long signaturesThisMonth,
  Optional<Integer> tierSignatureCap
) {}

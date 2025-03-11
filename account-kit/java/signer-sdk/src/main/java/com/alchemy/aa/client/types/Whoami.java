package com.alchemy.aa.client.types;

import com.alchemy.aa.client.types.TurnKey.TurnKeyStampedRequest;
import javax.annotation.Nullable;
import lombok.Builder;

public class Whoami {

  public record WhoamiRequest(TurnKeyStampedRequest stampedRequest) {}

  @Builder
  public record WhoamiResponse(
      @Nullable String email,
      String userId,
      String orgId,
      String address,
      @Nullable String solanaAddress
  ) {}

}

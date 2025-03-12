package com.alchemy.aa.client.api;

import com.alchemy.aa.Stamper.Stamp;
import lombok.Builder;

///  https://docs.alchemy.com/reference/authuser
public class AuthUser {

  public record WhoAmIRequest(
      String organizationId
  ){}

  @Builder
  public record Request(
      String url,
      String body,
      Stamp stamp
  ) {}

  public record Response(
      String email,
      String userId,
      String orgId,
      String address,
      String solanaAddress
  ) {}
}
